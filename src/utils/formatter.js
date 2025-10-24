// formatter.js - Enhanced message formatting with improved markdown support

/**
 * Format message content with enhanced markdown support
 */
class MessageFormatter {
    constructor() {
        this.codeBlockCounter = 0;
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    /**
     * Detect programming language from code block
     */
    detectLanguage(code) {
        const languagePatterns = {
            javascript: /\b(const|let|var|function|=>|console\.log)\b/,
            python: /\b(def|import|from|print|class|if __name__)\b/,
            java: /\b(public|private|class|void|static|extends)\b/,
            cpp: /\b(#include|std::|cout|cin|namespace)\b/,
            html: /<\/?[a-z][\s\S]*>/i,
            css: /\{[^}]*:[^}]*\}/,
            json: /^\s*[\{\[]/,
            bash: /\b(echo|cd|ls|mkdir|rm|sudo)\b/,
            sql: /\b(SELECT|INSERT|UPDATE|DELETE|FROM|WHERE)\b/i,
        };

        for (const [lang, pattern] of Object.entries(languagePatterns)) {
            if (pattern.test(code)) {
                return lang;
            }
        }

        return 'plaintext';
    }

    /**
     * Apply basic syntax highlighting
     */
    highlightCode(code, language) {
        // Basic syntax highlighting patterns
        const patterns = {
            keyword: /\b(const|let|var|function|class|if|else|for|while|return|import|from|export|async|await|try|catch|finally|throw|new|this|super|extends|implements|interface|type|enum|public|private|protected|static|readonly|def|print|True|False|None|select|where|insert|update|delete)\b/g,
            string: /(["'`])(?:(?=(\\?))\2.)*?\1/g,
            comment: /(\/\/.*$|\/\*[\s\S]*?\*\/|#.*$)/gm,
            number: /\b(\d+\.?\d*)\b/g,
            function: /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g,
        };

        let highlighted = this.escapeHtml(code);

        // Apply highlighting
        highlighted = highlighted.replace(patterns.comment, '<span class="syntax-comment">$1</span>');
        highlighted = highlighted.replace(patterns.string, '<span class="syntax-string">$1</span>');
        highlighted = highlighted.replace(patterns.keyword, '<span class="syntax-keyword">$1</span>');
        highlighted = highlighted.replace(patterns.number, '<span class="syntax-number">$1</span>');

        return highlighted;
    }

    /**
     * Format code blocks with language detection and syntax highlighting
     */
    formatCodeBlock(match, langAndCode) {
        const lines = langAndCode.split('\n');
        let language = 'plaintext';
        let code = langAndCode;

        // Check if first line is a language identifier
        if (lines[0] && lines[0].trim() && !/[<>{}()\[\]]/.test(lines[0]) && lines[0].length < 20) {
            language = lines[0].trim().toLowerCase();
            code = lines.slice(1).join('\n');
        }

        // Auto-detect if no language specified
        if (language === 'plaintext' || language === '') {
            language = this.detectLanguage(code);
        }

        // Apply syntax highlighting
        const highlighted = this.highlightCode(code, language);

        this.codeBlockCounter++;

        return `<div class="raycast-code" data-language="${language}">
            <div class="raycast-code-header">
                <span class="raycast-code-language">${language}</span>
                <button class="raycast-copy-btn" onclick="copyToClipboard(this)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    Copy
                </button>
            </div>
            <pre><code class="language-${language}">${highlighted}</code></pre>
        </div>`;
    }

    /**
     * Format inline code
     */
    formatInlineCode(match, code) {
        return `<code class="inline-code">${this.escapeHtml(code)}</code>`;
    }

    /**
     * Format lists (ordered and unordered)
     */
    formatLists(text) {
        // Unordered lists
        text = text.replace(/^[\s]*[-*+]\s+(.+)$/gm, '<li class="list-item">$1</li>');

        // Ordered lists
        text = text.replace(/^[\s]*\d+\.\s+(.+)$/gm, '<li class="list-item numbered">$1</li>');

        // Wrap consecutive list items in ul/ol tags
        text = text.replace(/(<li class="list-item">[\s\S]+?<\/li>)(?![\s]*<li)/g, '<ul class="message-list">$1</ul>');
        text = text.replace(/(<li class="list-item numbered">[\s\S]+?<\/li>)(?![\s]*<li)/g, '<ol class="message-list numbered">$1</ol>');

        return text;
    }

    /**
     * Format the complete message with all markdown features
     */
    format(text) {
        if (!text) return '';

        this.codeBlockCounter = 0;

        // Store code blocks temporarily to avoid processing their content
        const codeBlocks = [];
        text = text.replace(/```([\s\S]*?)```/g, (match, code) => {
            const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
            codeBlocks.push(this.formatCodeBlock(match, code));
            return placeholder;
        });

        // Store inline code temporarily
        const inlineCodes = [];
        text = text.replace(/`([^`]+)`/g, (match, code) => {
            const placeholder = `__INLINE_CODE_${inlineCodes.length}__`;
            inlineCodes.push(this.formatInlineCode(match, code));
            return placeholder;
        });

        // Format headers (h1-h3)
        text = text.replace(/^### (.+)$/gm, '<h3 class="message-heading">$1</h3>');
        text = text.replace(/^## (.+)$/gm, '<h2 class="message-heading">$1</h2>');
        text = text.replace(/^# (.+)$/gm, '<h1 class="message-heading">$1</h1>');

        // Format bold text
        text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        text = text.replace(/__(.+?)__/g, '<strong>$1</strong>');

        // Format italic text
        text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
        text = text.replace(/_(.+?)_/g, '<em>$1</em>');

        // Format strikethrough
        text = text.replace(/~~(.+?)~~/g, '<del>$1</del>');

        // Format links
        text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="message-link">$1</a>');

        // Format lists
        text = this.formatLists(text);

        // Format blockquotes
        text = text.replace(/^>\s+(.+)$/gm, '<blockquote class="message-quote">$1</blockquote>');

        // Format horizontal rules
        text = text.replace(/^---+$/gm, '<hr class="message-divider">');

        // Format line breaks (double newline = paragraph, single = br)
        text = text.replace(/\n\n/g, '</p><p class="message-paragraph">');
        text = text.replace(/\n/g, '<br>');
        text = `<p class="message-paragraph">${text}</p>`;

        // Clean up empty paragraphs
        text = text.replace(/<p class="message-paragraph"><\/p>/g, '');

        // Restore code blocks
        codeBlocks.forEach((block, index) => {
            text = text.replace(`__CODE_BLOCK_${index}__`, block);
        });

        // Restore inline codes
        inlineCodes.forEach((code, index) => {
            text = text.replace(`__INLINE_CODE_${index}__`, code);
        });

        return text;
    }

    /**
     * Format timestamp
     */
    formatTimestamp(date) {
        if (!date) return '';

        const now = new Date();
        const messageDate = new Date(date);
        const diffMs = now - messageDate;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return messageDate.toLocaleDateString();
    }
}

// Export singleton instance
if (typeof module !== 'undefined' && module.exports) {
    module.exports = new MessageFormatter();
}
