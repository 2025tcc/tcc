// Utilitários específicos para formulários

// Configuração de máscaras e validações
function setupFormValidation() {
    // Validação em tempo real para campos numéricos
    const numericFields = document.querySelectorAll('input[type="number"]');
    numericFields.forEach(field => {
        field.addEventListener('input', function(e) {
            if (e.target.value < 0) {
                e.target.value = 0;
            }
        });
    });

    // Validação de campos obrigatórios
    const requiredFields = document.querySelectorAll('input[required]');
    requiredFields.forEach(field => {
        field.addEventListener('blur', function(e) {
            if (!e.target.value.trim()) {
                e.target.style.borderColor = '#dc3545';
            } else {
                e.target.style.borderColor = '#ddd';
            }
        });
    });
}

// Formatação de preços
function formatPrice(input) {
    input.addEventListener('input', function(e) {
        let value = e.target.value.replace(/[^\d.,]/g, '');
        value = value.replace(',', '.');
        
        // Garantir apenas um ponto decimal
        const parts = value.split('.');
        if (parts.length > 2) {
            value = parts[0] + '.' + parts.slice(1).join('');
        }
        
        e.target.value = value;
    });
}

// Auto-completar dados de produto baseado no EAN (simulação)
function setupEANLookup() {
    const eanInputs = document.querySelectorAll('input[name="eanCodes[]"]');
    eanInputs.forEach(input => {
        input.addEventListener('blur', function(e) {
            const ean = e.target.value.trim();
            
            // Simulação de busca por EAN (em um sistema real, seria uma API)
            if (ean.length >= 8) {
                const mockProducts = {
                    '7891000100103': {
                        name: 'Leite Condensado Moça',
                        category: 'Laticínios'
                    },
                    '7622210951441': {
                        name: 'Chocolate Kit Kat',
                        category: 'Doces'
                    },
                    '7891000053607': {
                        name: 'Nescau Cereal',
                        category: 'Cereais'
                    }
                };

                if (mockProducts[ean]) {
                    const product = mockProducts[ean];
                    const nameField = document.querySelector('[name="nomeProduto"]');
                    
                    // Só preencher se o campo estiver vazio
                    if (nameField && !nameField.value.trim()) {
                        if (confirm(`Produto encontrado: ${product.name}. Deseja preencher automaticamente?`)) {
                            nameField.value = product.name;
                            nameField.style.backgroundColor = '#e8f5e8';
                            
                            setTimeout(() => {
                                nameField.style.backgroundColor = '';
                            }, 2000);
                        }
                    }
                }
            }
        });
    });
}

// Validação de EAN (código de barras)
function validateEAN(ean) {
    // Remove espaços e caracteres não numéricos
    ean = ean.replace(/\D/g, '');
    
    // Deve ter 8, 12, 13 ou 14 dígitos
    if (![8, 12, 13, 14].includes(ean.length)) {
        return false;
    }

    // Validação do dígito verificador para EAN-13
    if (ean.length === 13) {
        let sum = 0;
        for (let i = 0; i < 12; i++) {
            sum += parseInt(ean[i]) * (i % 2 === 0 ? 1 : 3);
        }
        const checkDigit = (10 - (sum % 10)) % 10;
        return checkDigit === parseInt(ean[12]);
    }
    
    return true; // Para outros tamanhos, assumir válido
}

// Aplicar validação de EAN aos campos
function setupEANValidation() {
    document.addEventListener('input', function(e) {
        if (e.target.name === 'eanCodes[]') {
            const ean = e.target.value.trim();
            
            if (ean.length >= 8) {
                if (!validateEAN(ean)) {
                    e.target.style.borderColor = '#dc3545';
                    e.target.title = 'Código EAN inválido';
                } else {
                    e.target.style.borderColor = '#28a745';
                    e.target.title = '';
                }
            } else {
                e.target.style.borderColor = '#ddd';
                e.target.title = '';
            }
        }
    });
}

// Limitar caracteres em campos de texto
function limitTextLength() {
    const productNameFields = document.querySelectorAll('[name="nomeProduto"]');
    productNameFields.forEach(field => {
        field.setAttribute('maxlength', '100');
        
        field.addEventListener('input', function(e) {
            const remaining = 100 - e.target.value.length;
            let counter = e.target.parentNode.querySelector('.char-counter');
            
            if (!counter) {
                counter = document.createElement('small');
                counter.className = 'char-counter';
                counter.style.color = '#666';
                counter.style.fontSize = '12px';
                e.target.parentNode.appendChild(counter);
            }
            
            counter.textContent = `${remaining} caracteres restantes`;
            
            if (remaining < 20) {
                counter.style.color = '#dc3545';
            } else {
                counter.style.color = '#666';
            }
        });
    });
}

// Salvar rascunho do formulário automaticamente
function setupAutoSave() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        const formId = form.id;
        
        // Carregar rascunho salvo
        const savedData = localStorage.getItem(`draft_${formId}`);
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                Object.keys(data).forEach(key => {
                    const field = form.querySelector(`[name="${key}"]`);
                    if (field && field.type !== 'file') {
                        field.value = data[key];
                    }
                });
                
                // Mostrar notificação de rascunho carregado
                showNotification('Rascunho carregado automaticamente', 'info');
            } catch (e) {
                console.log('Erro ao carregar rascunho:', e);
            }
        }

        // Salvar rascunho a cada mudança
        form.addEventListener('input', function(e) {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            
            // Remover campos de arquivo
            Object.keys(data).forEach(key => {
                if (form.querySelector(`[name="${key}"]`).type === 'file') {
                    delete data[key];
                }
            });
            
            localStorage.setItem(`draft_${formId}`, JSON.stringify(data));
        });

        // Limpar rascunho ao enviar formulário
        form.addEventListener('submit', function() {
            localStorage.removeItem(`draft_${formId}`);
        });
    });
}

// Mostrar notificações
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: bold;
        z-index: 10000;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
    `;
    
    if (type === 'success') {
        notification.style.backgroundColor = '#28a745';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#dc3545';
    } else if (type === 'info') {
        notification.style.backgroundColor = '#007bff';
    }
    
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remover após 3 segundos
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Validação de imagens
function setupImageValidation() {
    const imageInputs = document.querySelectorAll('input[type="file"][accept*="image"]');
    
    imageInputs.forEach(input => {
        input.addEventListener('change', function(e) {
            const file = e.target.files[0];
            
            if (file) {
                // Validar tamanho (máximo 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    alert('A imagem deve ter no máximo 5MB');
                    e.target.value = '';
                    return;
                }
                
                // Validar tipo
                if (!file.type.startsWith('image/')) {
                    alert('Por favor, selecione apenas arquivos de imagem');
                    e.target.value = '';
                    return;
                }
                
                // Validar dimensões
                const img = new Image();
                img.onload = function() {
                    if (this.width > 2000 || this.height > 2000) {
                        if (confirm('A imagem é muito grande (recomendado máximo 2000x2000px). Deseja continuar?')) {
                            // Usuário decidiu continuar
                        } else {
                            e.target.value = '';
                        }
                    }
                };
                img.src = URL.createObjectURL(file);
            }
        });
    });
}

// Inicializar todos os utilitários
function initFormUtils() {
    setupFormValidation();
    setupEANLookup();
    setupEANValidation();
    limitTextLength();
    setupImageValidation();
    
    // Auto-save apenas em desenvolvimento/teste (não usar em produção)
    if (window.location.hostname === 'localhost') {
        setupAutoSave();
    }
    
    // Aplicar formatação de preço aos campos de preço
    const priceFields = document.querySelectorAll('[name="preco"]');
    priceFields.forEach(formatPrice);
}

// Exportar funções para uso global
if (typeof window !== 'undefined') {
    window.FormUtils = {
        initFormUtils,
        showNotification,
        validateEAN,
        formatPrice
    };
}