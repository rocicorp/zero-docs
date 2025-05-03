#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Extract page paths from routes-config.ts
function extractPagesFromRoutesConfig() {
  const routesConfigPath = path.join(__dirname, 'lib', 'routes-config.ts');
  const content = fs.readFileSync(routesConfigPath, 'utf8');
  
  // Extract all href values
  const matches = [...content.matchAll(/href:\s*['"]([^'"]*)['"]/g)];
  return matches
    .map(match => match[1])
    .filter(href => href !== '')
    .map(href => href.startsWith('/') ? href.substring(1) : href)
    .filter(href => href !== '');
}

// Extract Markdown links to other docs pages
function extractLinksFromMarkdown(content, docsDir) {
  // Match markdown link pattern [text](/docs/path) or [text](path)
  const linkRegex = /\[.*?\]\((?:\/docs\/)?([^)]+)\)/g;
  const links = new Set();
  
  let match;
  while ((match = linkRegex.exec(content)) !== null) {
    const link = match[1].trim();
    
    // Only consider links that seem to point to other docs
    if (!link.startsWith('http') && !link.startsWith('#')) {
      // Check if this is likely a markdown file (either directly or index.mdx in directory)
      const mdxPath = path.join(docsDir, `${link}.mdx`);
      const dirIndexPath = path.join(docsDir, link, 'index.mdx');
      
      if (fs.existsSync(mdxPath)) {
        links.add(link);
      } else if (fs.existsSync(dirIndexPath)) {
        links.add(`${link}/index`);
      }
    }
  }
  
  return [...links];
}

// Process a single file and extract its content
function processFile(filePath, allText, processedFiles) {
  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const extractedText = content.replace(/^---[\s\S]*?---/m, '').trim();
    
    // Get the relative path for the file header
    const relativePath = filePath.split('/contents/docs/')[1];
    allText += `--- ${relativePath} ---\n\n`;
    allText += extractedText + '\n\n\n';
    
    processedFiles.add(relativePath);
    return { content, allText };
  } catch (error) {
    console.warn(`Warning: Error processing file ${filePath}: ${error.message}`);
    return null;
  }
}

// Generate the llms.txt file
function generateLLMsFile() {
  console.log('Generating llms.txt file...');
  
  const docsDir = path.join(__dirname, 'contents', 'docs');
  const outputFile = path.join(__dirname, 'public', 'llms.txt');
  
  try {
    // Get ordered pages from routes-config.ts
    const tocPages = extractPagesFromRoutesConfig();
    console.log(`Found ${tocPages.length} pages in routes-config.ts`);
    
    let allText = '';
    let processedFiles = new Set();
    let linkedPages = new Set();
    
    // First process all pages from TOC
    for (const page of tocPages) {
      // Check if this is a direct .mdx file
      const mdxPath = path.join(docsDir, `${page}.mdx`);
      
      // Check if this is a directory with index.mdx
      const dirIndexPath = path.join(docsDir, page, 'index.mdx');
      
      if (fs.existsSync(mdxPath)) {
        // It's a direct .mdx file
        const result = processFile(mdxPath, allText, processedFiles);
        if (result) {
          allText = result.allText;
          
          // Extract links from this file
          const links = extractLinksFromMarkdown(result.content, docsDir);
          links.forEach(link => linkedPages.add(link));
        }
      } else if (fs.existsSync(dirIndexPath)) {
        // It's a directory with index.mdx
        const result = processFile(dirIndexPath, allText, processedFiles);
        if (result) {
          allText = result.allText;
          
          // Extract links from this file
          const links = extractLinksFromMarkdown(result.content, docsDir);
          links.forEach(link => linkedPages.add(link));
        }
      } else {
        console.warn(`Warning: Neither ${mdxPath} nor ${dirIndexPath} found`);
      }
    }
    
    // Now process linked pages that weren't in the TOC
    const processedFromToc = processedFiles.size;
    console.log(`Processed ${processedFromToc} files from TOC, now checking for linked files...`);
    
    // Keep processing until no more new links are found
    let moreLinksFound = true;
    let iterations = 0;
    const maxIterations = 5; // Prevent infinite loops
    
    while (moreLinksFound && iterations < maxIterations) {
      iterations++;
      const prevProcessedCount = processedFiles.size;
      const newLinkedPages = new Set();
      
      for (const link of linkedPages) {
        // Skip if already processed
        if (processedFiles.has(`${link}.mdx`)) continue;
        
        // Process this linked file
        const mdxPath = path.join(docsDir, `${link}.mdx`);
        
        const result = processFile(mdxPath, allText, processedFiles);
        if (result) {
          allText = result.allText;
          
          // Extract more links from this file
          const moreLinks = extractLinksFromMarkdown(result.content, docsDir);
          moreLinks.forEach(l => newLinkedPages.add(l));
        }
      }
      
      // Add new found links to our set
      newLinkedPages.forEach(link => linkedPages.add(link));
      
      // Check if we processed any new files in this iteration
      if (processedFiles.size === prevProcessedCount) {
        moreLinksFound = false;
      }
    }
    
    // Write the extracted text to llms.txt
    fs.writeFileSync(outputFile, allText.trim());
    
    console.log(`Successfully generated llms.txt with content from ${processedFiles.size} files:`);
    console.log(`- ${processedFromToc} files from TOC`);
    console.log(`- ${processedFiles.size - processedFromToc} additional linked files`);
  } catch (error) {
    console.error('Error generating llms.txt:', error);
    process.exit(1);
  }
}

// Run the function
generateLLMsFile();