import React from 'react';
import { CopyOutlined } from '@ant-design/icons';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'; // Theme for code highlighting
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../css/CodeSnippetBox.css';

const CodeSnippetBox = ({ botId }) => {
  const codeSnippet = `
<script type="text/javascript">
  window.customChatBot = window.customChatBot || {};
  window.customChatBot.id = "${botId}"; // Replace with the unique bot ID
  (function() {
      var script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.src = 'https://botforge-plugin-js.vercel.app/plugin.obfuscated.js';
      var firstScript = document.getElementsByTagName('script')[0];
      firstScript.parentNode.insertBefore(script, firstScript);
  })();
</script>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(codeSnippet).then(() => {
      toast.success('Code copied to clipboard!', {
        position: 'bottom-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }).catch((error) => {
      toast.error('Failed to copy the code!', {
        position: 'bottom-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      console.error('Clipboard copy failed:', error);
    });
  };

  return (
    <div className="code-snippet-box">
      <ToastContainer />
      <div className="code-header">
        <h3>Embed This Code</h3>
        <button onClick={copyToClipboard} className="copy-button">
          <CopyOutlined /> Copy
        </button>
      </div>
      <div className="code-content">
        <SyntaxHighlighter language="javascript" style={vscDarkPlus} showLineNumbers>
          {codeSnippet}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default CodeSnippetBox;
