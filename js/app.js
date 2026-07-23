/**
 * TrackNfind JavaScript Application Core
 * Interactive Modal handling, Live AJAX Item filtering, and Form Validations
 */

document.addEventListener('DOMContentLoaded', () => {
    // Password visibility togglers
    const togglePasswordButtons = document.querySelectorAll('.toggle-password-btn');
    togglePasswordButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = btn.getAttribute('data-target');
            const input = document.getElementById(targetId);
            if (input) {
                const isPassword = input.type === 'password';
                input.type = isPassword ? 'text' : 'password';
                btn.textContent = isPassword ? '👁️ Hide' : '👁️ Show';
            }
        });
    });

    // Real-time password strength & criteria checker
    const registerPasswordInput = document.getElementById('register_password');
    if (registerPasswordInput) {
        const strengthBar = document.getElementById('pwd_strength_bar');
        const strengthLabel = document.getElementById('pwd_strength_label');

        const ruleLen = document.getElementById('rule_len');
        const ruleUpper = document.getElementById('rule_upper');
        const ruleLower = document.getElementById('rule_lower');
        const ruleNum = document.getElementById('rule_num');
        const ruleSpec = document.getElementById('rule_spec');

        registerPasswordInput.addEventListener('input', () => {
            const val = registerPasswordInput.value;
            
            const hasLen = val.length >= 8;
            const hasUpper = /[A-Z]/.test(val);
            const hasLower = /[a-z]/.test(val);
            const hasNum = /[0-9]/.test(val);
            const hasSpec = /[^A-Za-z0-9]/.test(val);

            let score = 0;
            if (hasLen) score++;
            if (hasUpper) score++;
            if (hasLower) score++;
            if (hasNum) score++;
            if (hasSpec) score++;

            // Update criteria indicators
            updateRuleItem(ruleLen, hasLen, 'Min 8 Characters');
            updateRuleItem(ruleUpper, hasUpper, '1 Uppercase Letter (A-Z)');
            updateRuleItem(ruleLower, hasLower, '1 Lowercase Letter (a-z)');
            updateRuleItem(ruleNum, hasNum, '1 Number (0-9)');
            updateRuleItem(ruleSpec, hasSpec, '1 Special Character (!@#$%^&*)');

            let label = 'Weak';
            let color = '#ef4444';
            let pct = (score / 5) * 100;

            if (score === 5) {
                label = 'Strong & Secure';
                color = '#10b981';
            } else if (score >= 3) {
                label = 'Medium';
                color = '#f59e0b';
            }

            if (strengthBar) {
                strengthBar.style.width = pct + '%';
                strengthBar.style.backgroundColor = color;
            }
            if (strengthLabel) {
                strengthLabel.textContent = val.length > 0 ? `Strength: ${label}` : 'Strength: Weak';
                strengthLabel.style.color = color;
            }
        });
    }

    function updateRuleItem(elem, isValid, text) {
        if (!elem) return;
        if (isValid) {
            elem.innerHTML = `✅ <span style="color: #10b981; font-weight: 600;">${text}</span>`;
        } else {
            elem.innerHTML = `❌ <span style="color: #64748b;">${text}</span>`;
        }
    }

    // Role selector pills in Login / Register
    const rolePills = document.querySelectorAll('.role-pill');
    const selectedRoleInput = document.getElementById('selected_role_input');
    rolePills.forEach(pill => {
        pill.addEventListener('click', () => {
            rolePills.forEach(p => p.classList.remove('btn-primary', 'btn-emerald'));
            rolePills.forEach(p => p.classList.add('btn-secondary'));
            
            const role = pill.getAttribute('data-role');
            if (selectedRoleInput) {
                selectedRoleInput.value = role;
            }
            if (role === 'officer') {
                pill.classList.remove('btn-secondary');
                pill.classList.add('btn-emerald');
            } else {
                pill.classList.remove('btn-secondary');
                pill.classList.add('btn-primary');
            }

            // Toggle student ID field visibility if in registration
            const studentIdGroup = document.getElementById('student_id_group');
            if (studentIdGroup) {
                studentIdGroup.style.display = (role === 'student') ? 'block' : 'none';
            }
        });
    });

    // FAQ Accordion Interactivity
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const questionBtn = item.querySelector('.faq-question');
        if (questionBtn) {
            questionBtn.addEventListener('click', () => {
                const isOpen = item.classList.contains('active');
                faqItems.forEach(otherItem => otherItem.classList.remove('active'));
                if (!isOpen) {
                    item.classList.add('active');
                }
            });
        }
    });
});

/**
 * Open Item Details / Claim Modal
 */
function openClaimModal(itemJsonStr) {
    let item;
    try {
        item = typeof itemJsonStr === 'string' ? JSON.parse(itemJsonStr) : itemJsonStr;
    } catch (e) {
        console.error("Invalid item JSON", e);
        return;
    }

    const modal = document.getElementById('claim_modal');
    if (!modal) return;

    document.getElementById('modal_item_title').textContent = item.title;
    document.getElementById('modal_item_id').value = item.id;
    document.getElementById('modal_item_category').textContent = item.category;
    document.getElementById('modal_item_location').textContent = item.location;
    document.getElementById('modal_item_date').textContent = item.date_event;
    document.getElementById('modal_item_desc').textContent = item.description;

    const imgElem = document.getElementById('modal_item_img');
    if (imgElem) {
        imgElem.src = item.image_url || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80';
    }

    modal.style.display = 'flex';
}

/**
 * Close Claim Modal
 */
function closeClaimModal() {
    const modal = document.getElementById('claim_modal');
    if (modal) {
        modal.style.display = 'none';
    }
}
