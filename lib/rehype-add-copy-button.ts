import {Plugin} from 'unified';
import {visit} from 'unist-util-visit';
import {Element} from 'hast';

const rehypeAddCopyButton: Plugin = () => {
  return tree => {
    visit(tree, 'element', (node: Element) => {
      if (
        node.tagName === 'pre' &&
        node.children.some(
          child => child.type === 'element' && child.tagName === 'code',
        )
      ) {
        // Add the copy button element
        const copyButton: Element = {
          type: 'element',
          tagName: 'button',
          properties: {
            className: ['font-regular copy-button'],
          },
          children: [{type: 'text', value: 'Copy'}],
        };

        // Add the copy button to the <pre> element
        if (!node.properties) {
          node.properties = {};
        }

        const existingClassName = node.properties.className;
        const normalizedClassName = Array.isArray(existingClassName)
          ? existingClassName.filter(
              cls => typeof cls === 'string' || typeof cls === 'number',
            )
          : typeof existingClassName === 'string' ||
              typeof existingClassName === 'number'
            ? [existingClassName]
            : [];

        node.properties.className = [...normalizedClassName, 'has-copy-button'];

        // Add the copy button as the first child
        node.children = [copyButton, ...node.children];
      }
    });
  };
};

export default rehypeAddCopyButton;
