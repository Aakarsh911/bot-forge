import React, { useEffect } from "react";
import Prism from "prismjs"; // Import Prism.js
import "prismjs/themes/prism-tomorrow.css"; // Use any Prism theme you prefer
import "../css/IntegrationCode.css";

export default function IntegrationCode() {
  const codeString = `
<script type="text/javascript">
  window.customChatBot = window.customChatBot || {};
  window.customChatBot.id = "<your_bot_id>"; // Replace with the unique bot ID
  (function() {
      var script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.src = 'https://botforge-plugin-js.vercel.app/plugin.js';
      var firstScript = document.getElementsByTagName('script')[0];
      firstScript.parentNode.insertBefore(script, firstScript);
  })();
</script>
  `;

  useEffect(() => {
    Prism.highlightAll(); // Reinitialize Prism.js to highlight code
  }, []);

  return (
    <div className="integration-section">
      <h2 className="integration-heading">Easy Integration</h2>
      <p className="integration-description">
        Add this script to your website to integrate your custom chatbot in seconds.
      </p>
      <pre className="code-box">
        <code className="language-html">{codeString}</code>
      </pre>
    </div>
  );
}
