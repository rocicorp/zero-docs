import {createHighlighter} from 'shiki';
import {rociDark} from './roci-dark';
import {rociLight} from './roci-light';

const highlighter = await createHighlighter({
  themes: [rociDark, rociLight],
  langs: [
    'plaintext',
    'js',
    'ts',
    'tsx',
    'bash',
    'json',
    'dockerfile',
    'docker',
    'sql',
    'console',
  ],
});

export default highlighter;
