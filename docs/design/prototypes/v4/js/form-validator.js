/**
 * Scripter Form Validator
 * 表单验证组件 - 支持实时验证和提交前检查
 */

class ScripterFormValidator {
    constructor(options = {}) {
        this.form = options.form || document.querySelector('form[data-validate]');
        this.rules = options.rules || {};
        this.onValid = options.onValid || null;
        this.onInvalid = options.onInvalid || null;
        this.realtime = options.realtime !== false;
        this.errorClass = options.errorClass || 'has-error';
        this.successClass = options.successClass || 'has-success';
        this.messageSelector = options.messageSelector || '[data-validation-message]';

        this.init();
    }

    init() {
        if (!this.form) {
            console.error('Form not found');
            return;
        }

        this.parseRules();
        this.bindEvents();
        this.addStyles();
    }

    parseRules() {
        // Parse data-validate attributes from form fields
        const fields = this.form.querySelectorAll('[data-validate]');
        fields.forEach(field => {
            const name = field.name || field.id;
            const rules = field.dataset.validate.split('|');
            this.rules[name] = rules;

            // Parse custom message if exists
            const messageEl = field.closest('.form-group')?.querySelector(this.messageSelector);
            if (messageEl) {
                field.dataset.validationMessage = messageEl.textContent;
            }
        });
    }

    bindEvents() {
        // Form submit
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Real-time validation
        if (this.realtime) {
            const fields = this.form.querySelectorAll('[data-validate]');
            fields.forEach(field => {
                // Validate on blur
                field.addEventListener('blur', () => this.validateField(field));

                // Validate on input after first error
                field.addEventListener('input', () => {
                    if (field.classList.contains(this.errorClass)) {
                        this.validateField(field);
                    }
                });
            });
        }
    }

    validateField(field) {
        const name = field.name || field.id;
        const rules = this.rules[name];

        if (!rules) return true;

        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        for (const rule of rules) {
            const result = this.validateRule(rule, value, field);
            if (!result.valid) {
                isValid = false;
                errorMessage = result.message;
                break;
            }
        }

        this.updateFieldStatus(field, isValid, errorMessage);
        return isValid;
    }

    validateRule(rule, value, field) {
        // Parse rule with optional parameter (e.g., "min:5")
        const [ruleName, ruleParam] = rule.split(':');

        switch (ruleName) {
            case 'required':
                if (!value) {
                    return { valid: false, message: this.getMessage(field, 'required', '此字段为必填项') };
                }
                break;

            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (value && !emailRegex.test(value)) {
                    return { valid: false, message: this.getMessage(field, 'email', '请输入有效的邮箱地址') };
                }
                break;

            case 'url':
                try {
                    if (value) new URL(value);
                } catch {
                    return { valid: false, message: this.getMessage(field, 'url', '请输入有效的 URL') };
                }
                break;

            case 'min':
                if (value.length < parseInt(ruleParam)) {
                    return { valid: false, message: this.getMessage(field, 'min', `至少需要 ${ruleParam} 个字符`) };
                }
                break;

            case 'max':
                if (value.length > parseInt(ruleParam)) {
                    return { valid: false, message: this.getMessage(field, 'max', `最多允许 ${ruleParam} 个字符`) };
                }
                break;

            case 'minlength':
                if (value.length < parseInt(ruleParam)) {
                    return { valid: false, message: this.getMessage(field, 'minlength', `至少需要 ${ruleParam} 个字符`) };
                }
                break;

            case 'maxlength':
                if (value.length > parseInt(ruleParam)) {
                    return { valid: false, message: this.getMessage(field, 'maxlength', `最多允许 ${ruleParam} 个字符`) };
                }
                break;

            case 'pattern':
                const pattern = new RegExp(ruleParam);
                if (value && !pattern.test(value)) {
                    return { valid: false, message: this.getMessage(field, 'pattern', '格式不正确') };
                }
                break;

            case 'match':
                const matchField = this.form.querySelector(`[name="${ruleParam}"], #${ruleParam}`);
                if (matchField && value !== matchField.value) {
                    return { valid: false, message: this.getMessage(field, 'match', '两次输入不一致') };
                }
                break;

            case 'api-key':
                // API key format validation (alphanumeric, dots, hyphens, underscores)
                const apiKeyRegex = /^[a-zA-Z0-9._-]+$/;
                if (value && !apiKeyRegex.test(value)) {
                    return { valid: false, message: this.getMessage(field, 'api-key', 'API Key 格式不正确') };
                }
                break;

            case 'api-url':
                try {
                    if (value) {
                        const url = new URL(value);
                        if (!url.protocol.startsWith('http')) {
                            throw new Error('Invalid protocol');
                        }
                    }
                } catch {
                    return { valid: false, message: this.getMessage(field, 'api-url', '请输入有效的 API 地址') };
                }
                break;

            default:
                console.warn(`Unknown validation rule: ${ruleName}`);
        }

        return { valid: true };
    }

    getMessage(field, rule, defaultMessage) {
        // Check for custom data attribute message
        const customMessage = field.dataset[`${rule}Message`];
        if (customMessage) return customMessage;

        // Check for data-validate-message attribute
        if (field.dataset.validationMessage) {
            return field.dataset.validationMessage;
        }

        return defaultMessage;
    }

    updateFieldStatus(field, isValid, errorMessage = '') {
        const formGroup = field.closest('.form-group');
        const messageEl = formGroup?.querySelector(this.messageSelector);

        // Remove both classes first
        field.classList.remove(this.errorClass, this.successClass);
        if (formGroup) {
            formGroup.classList.remove(this.errorClass, this.successClass);
        }

        if (isValid) {
            field.classList.add(this.successClass);
            if (formGroup) {
                formGroup.classList.add(this.successClass);
            }
            if (messageEl) {
                messageEl.textContent = '';
                messageEl.style.display = 'none';
            }
        } else {
            field.classList.add(this.errorClass);
            if (formGroup) {
                formGroup.classList.add(this.errorClass);
            }
            if (messageEl) {
                messageEl.textContent = errorMessage;
                messageEl.style.display = 'block';
            }
        }
    }

    validateForm() {
        const fields = this.form.querySelectorAll('[data-validate]');
        let isValid = true;
        let firstInvalidField = null;

        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
                if (!firstInvalidField) {
                    firstInvalidField = field;
                }
            }
        });

        if (firstInvalidField) {
            firstInvalidField.focus();
        }

        return isValid;
    }

    handleSubmit(e) {
        e.preventDefault();

        if (this.validateForm()) {
            // Form is valid
            const formData = new FormData(this.form);
            const data = Object.fromEntries(formData.entries());

            if (this.onValid) {
                this.onValid(data, this.form);
            }
        } else {
            // Form is invalid
            if (this.onInvalid) {
                this.onInvalid(this.form);
            }

            // Add shake animation
            this.form.classList.add('shake');
            setTimeout(() => {
                this.form.classList.remove('shake');
            }, 500);
        }
    }

    addStyles() {
        const styleId = 'form-validator-styles';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .form-group {
                position: relative;
            }

            .has-error input,
            .has-error textarea,
            .has-error select {
                border-color: #C96262 !important;
                box-shadow: 0 0 0 3px rgba(201, 98, 98, 0.1) !important;
            }

            .has-success input,
            .has-success textarea,
            .has-success select {
                border-color: #7FA870 !important;
            }

            .has-success::after {
                content: '';
                position: absolute;
                right: 12px;
                top: 50%;
                transform: translateY(-50%);
                width: 16px;
                height: 16px;
                background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%237FA870" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>') center/contain no-repeat;
            }

            [data-validation-message] {
                display: none;
                font-size: 11px;
                color: #C96262;
                margin-top: 4px;
            }

            .has-error [data-validation-message] {
                display: block;
            }

            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-10px); }
                75% { transform: translateX(10px); }
            }

            .shake {
                animation: shake 0.5s ease-in-out;
            }
        `;
        document.head.appendChild(style);
    }

    destroy() {
        // Remove event listeners and styles
        this.form.removeEventListener('submit', this.handleSubmit);
        const style = document.getElementById('form-validator-styles');
        if (style) style.remove();
    }
}

// Export for global use
window.ScripterFormValidator = ScripterFormValidator;
