// Custom CSS to override PrismJS themes
export const customHighlightCSS = `

  pre[class*="language-"]{
    padding: 0.5rem;
  }

  .line-numbers-rows > span:before {
    content: counter(linenumber);
    color: #9FFCEF; 
    display: block;
    padding-right: 0.8em;
    text-align: right;
  }

  .line-highlight {
    background: rgba(71, 85, 105, 0.25);
  }

  .line-numbers .line-numbers-rows {
    border-right: 1px solid #6B7280;
  }

  pre[class*="language-"] {
    padding: 1em;
    margin: 0 0 0.5em 0; 
    overflow: auto;
  }
`;
