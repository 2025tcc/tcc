// Variáveis globais do sistema
let currentUserType = '';
let isLoginMode = true;
let fornecedorProducts = [];
let vendedorProducts = [];
let currentEditingProductId = null;
let currentEditingUserType = null;
let currentSearchTerm = '';

// Seleção de tipo de usuário
function selectUserType(type) {
    currentUserType = type;
    document.getElementById('aboutScreen').style.display = 'none';
    document.getElementById('authScreen').style.display = 'flex';
    toggleAuth('login');
}

// Toggle entre login e cadastro
function toggleAuth(mode) {
    isLoginMode = mode === 'login';
    
    // Atualizar botões
    document.getElementById('loginBtn').classList.toggle('active', isLoginMode);
    document.getElementById('registerBtn').classList.toggle('active', !isLoginMode);
    
    // Atualizar título
    document.getElementById('formTitle').textContent = isLoginMode ? 'Login' : 'Cadastro';
    document.getElementById('submitBtn').textContent = isLoginMode ? 'ENTRAR' : 'CADASTRAR EMPRESA';
    
    // Gerar campos do formulário
    generateFormFields();
}

function generateFormFields() {
    const formGrid = document.getElementById('formGrid');
    formGrid.innerHTML = '';

    if (isLoginMode) {
        // Campos para login
        formGrid.innerHTML = `
            <div class="form-group full-width">
                <label for="nomeLogin">Nome da Empresa</label>
                <input type="text" id="nomeLogin" name="nome" required>
            </div>
            <div class="form-group">
                <label for="cnpjLogin">CNPJ</label>
                <input type="text" id="cnpjLogin" name="cnpj" pattern="[0-9]{2}\.?[0-9]{3}\.?[0-9]{3}\/?[0-9]{4}-?[0-9]{2}" placeholder="00.000.000/0000-00" required>
            </div>
            <div class="form-group">
                <label for="senhaLogin">Senha</label>
                <input type="password" id="senhaLogin" name="senha" required>
            </div>
        `;
    } else {
        // Campos para cadastro
        formGrid.innerHTML = `
            <div class="form-group full-width">
                <label for="nome">Nome da Empresa</label>
                <input type="text" id="nome" name="nome" required>
            </div>
            <div class="form-group">
                <label for="cnpj">CNPJ</label>
                <input type="text" id="cnpj" name="cnpj" pattern="[0-9]{2}\.?[0-9]{3}\.?[0-9]{3}\/?[0-9]{4}-?[0-9]{2}" placeholder="00.000.000/0000-00" required>
            </div>
            <div class="form-group">
                <label for="uf">UF</label>
                <select id="uf" name="uf" required>
                    <option value="">Selecione</option>
                    <option value="AC">AC</option>
                    <option value="AL">AL</option>
                    <option value="AP">AP</option>
                    <option value="AM">AM</option>
                    <option value="BA">BA</option>
                    <option value="CE">CE</option>
                    <option value="DF">DF</option>
                    <option value="ES">ES</option>
                    <option value="GO">GO</option>
                    <option value="MA">MA</option>
                    <option value="MT">MT</option>
                    <option value="MS">MS</option>
                    <option value="MG">MG</option>
                    <option value="PA">PA</option>
                    <option value="PB">PB</option>
                    <option value="PR">PR</option>
                    <option value="PE">PE</option>
                    <option value="PI">PI</option>
                    <option value="RJ">RJ</option>
                    <option value="RN">RN</option>
                    <option value="RS">RS</option>
                    <option value="RO">RO</option>
                    <option value="RR">RR</option>
                    <option value="SC">SC</option>
                    <option value="SP">SP</option>
                    <option value="SE">SE</option>
                    <option value="TO">TO</option>
                </select>
            </div>
            <div class="form-group">
                <label for="endereco">Endereço</label>
                <input type="text" id="endereco" name="endereco" required>
            </div>
            <div class="form-group">
                <label for="cidade">Cidade</label>
                <input type="text" id="cidade" name="cidade" required>
            </div>
            <div class="form-group">
                <label for="razaoSocial">Razão Social</label>
                <input type="text" id="razaoSocial" name="razaoSocial" required>
            </div>
            <div class="form-group">
                <label for="cep">CEP</label>
                <input type="text" id="cep" name="cep" pattern="[0-9]{5}-?[0-9]{3}" placeholder="00000-000" required>
            </div>
            <div class="form-group">
                <label for="senha">Senha</label>
                <input type="password" id="senha" name="senha" required>
            </div>
        `;
    }

    // Reaplica máscaras
    applyMasks();
}

function applyMasks() {
    // Máscara para CNPJ
    const cnpjFields = document.querySelectorAll('[name="cnpj"]');
    cnpjFields.forEach(field => {
        field.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length <= 14) {
                value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
                e.target.value = value;
            }
        });
    });

    // Máscara para CEP
    const cepField = document.getElementById('cep');
    if (cepField) {
        cepField.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length <= 8) {
                value = value.replace(/^(\d{5})(\d{3})$/, '$1-$2');
                e.target.value = value;
            }
        });

        // Buscar endereço pelo CEP
        cepField.addEventListener('blur', function(e) {
            const cep = e.target.value.replace(/\D/g, '');
            if (cep.length === 8) {
                fetch(`https://viacep.com.br/ws/${cep}/json/`)
                    .then(response => response.json())
                    .then(data => {
                        if (!data.erro) {
                            const enderecoField = document.getElementById('endereco');
                            const cidadeField = document.getElementById('cidade');
                            const ufField = document.getElementById('uf');
                            
                            if (enderecoField) enderecoField.value = data.logradouro;
                            if (cidadeField) cidadeField.value = data.localidade;
                            if (ufField) ufField.value = data.uf;
                        }
                    })
                    .catch(error => console.log('Erro ao buscar CEP:', error));
            }
        });
    }
}

// Navegação
function goBack() {
    document.getElementById('authScreen').style.display = 'none';
    document.getElementById('aboutScreen').style.display = 'flex';
}

function logout() {
    document.getElementById('fornecedorDashboard').style.display = 'none';
    document.getElementById('vendedorDashboard').style.display = 'none';
    document.getElementById('aboutScreen').style.display = 'flex';
    currentUserType = '';
}

// Função para carregar formulários dinamicamente
async function loadForm(userType) {
    const formContainer = document.getElementById(`${userType}FormContainer`);
    
    try {
        const response = await fetch(`${userType}-form.html`);
        const formHTML = await response.text();
        formContainer.innerHTML = formHTML;
        
        // Reinicializar event listeners específicos do formulário
        setupFormEventListeners(userType);
    } catch (error) {
        console.log('Formulário carregado via fallback');
        // Fallback: usar formulários inline se os arquivos não existirem
        loadFormFallback(userType);
    }
}

function loadFormFallback(userType) {
    const formContainer = document.getElementById(`${userType}FormContainer`);
    
    if (userType === 'fornecedor') {
        formContainer.innerHTML = getFornecedorFormHTML();
    } else if (userType === 'vendedor') {
        formContainer.innerHTML = getVendedorFormHTML();
    }
    
    setupFormEventListeners(userType);
}

function getFornecedorFormHTML() {
    return `
        <div class="product-form-container" id="fornecedorProductForm" style="display: none;">
            <h2 class="product-form-title" id="fornecedorFormTitle">Cadastrar Novo Produto</h2>
            <form id="fornecedorForm">
                <input type="hidden" id="fornecedorProductId" name="productId">
                <div class="form-grid">
                    <div class="form-group full-width">
                        <label for="fornecedorNomeProduto">Nome do Produto</label>
                        <input type="text" id="fornecedorNomeProduto" name="nomeProduto" required>
                    </div>
                    
                    <div class="form-group full-width">
                        <label>Imagem do Produto</label>
                        <div class="image-upload-area" onclick="document.getElementById('fornecedorImageInput').click()">
                            <input type="file" id="fornecedorImageInput" accept="image/*" style="display: none;" onchange="previewImage(this, 'fornecedorImagePreview')">
                            <div id="fornecedorImagePreview">
                                <p>📷 Clique para adicionar uma imagem</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="fornecedorValidadeDias">Validade (dias)</label>
                        <input type="number" id="fornecedorValidadeDias" name="validadeDias" placeholder="Ex: 30" required>
                    </div>
                </div>
                
                <div class="ean-codes-container">
                    <h3>Códigos EAN</h3>
                    <div id="fornecedorEanCodesContainer">
                        <div class="ean-code-item">
                            <input type="text" name="eanCodes[]" placeholder="Código EAN" required>
                            <button type="button" class="remove-ean-btn" onclick="removeEanCode(this)" style="display: none;">×</button>
                        </div>
                    </div>
                    <button type="button" class="add-ean-btn" onclick="addEanCode('fornecedor')">+ Adicionar Código EAN</button>
                </div>
                
                <div class="nutritional-values">
                    <h3>Valores Nutricionais (por 100g)</h3>
                    <div class="nutritional-grid">
                        <div class="form-group">
                            <label for="calorias">Calorias (kcal)</label>
                            <input type="number" id="calorias" name="calorias" step="0.01">
                        </div>
                        <div class="form-group">
                            <label for="valorEnergetico">Valor Energético (kJ)</label>
                            <input type="number" id="valorEnergetico" name="valorEnergetico" step="0.01">
                        </div>
                        <div class="form-group">
                            <label for="carboidratos">Carboidratos (g)</label>
                            <input type="number" id="carboidratos" name="carboidratos" step="0.01">
                        </div>
                        <div class="form-group">
                            <label for="acucares">Açúcares (g)</label>
                            <input type="number" id="acucares" name="acucares" step="0.01">
                        </div>
                        <div class="form-group">
                            <label for="proteinas">Proteínas (g)</label>
                            <input type="number" id="proteinas" name="proteinas" step="0.01">
                        </div>
                        <div class="form-group">
                            <label for="gorduras">Gorduras (g)</label>
                            <input type="number" id="gorduras" name="gorduras" step="0.01">
                        </div>
                        <div class="form-group">
                            <label for="fibras">Fibras (g)</label>
                            <input type="number" id="fibras" name="fibras" step="0.01">
                        </div>
                        <div class="form-group">
                            <label for="sodio">Sódio (mg)</label>
                            <input type="number" id="sodio" name="sodio" step="0.01">
                        </div>
                    </div>
                </div>
                
                <div class="form-buttons">
                    <button type="button" class="back-to-dashboard-btn" onclick="showFornecedorSection('home')">← Voltar</button>
                    <button type="button" class="delete-button-form" id="fornecedorDeleteBtn" onclick="confirmDeleteProduct('fornecedor')" style="display: none;">EXCLUIR</button>
                    <button type="submit" class="submit-button-form" id="fornecedorSubmitBtn">CADASTRAR PRODUTO</button>
                </div>
            </form>
        </div>
    `;
}

function getVendedorFormHTML() {
    return `
        <div class="product-form-container" id="vendedorProductForm" style="display: none;">
            <h2 class="product-form-title" id="vendedorFormTitle">Cadastrar Novo Produto</h2>
            <form id="vendedorForm">
                <input type="hidden" id="vendedorProductId" name="productId">
                <div class="form-grid">
                    <div class="form-group full-width">
                        <label for="vendedorNomeProduto">Nome do Produto</label>
                        <input type="text" id="vendedorNomeProduto" name="nomeProduto" required>
                    </div>
                    
                    <div class="form-group full-width">
                        <label>Imagem do Produto</label>
                        <div class="image-upload-area" onclick="document.getElementById('vendedorImageInput').click()">
                            <input type="file" id="vendedorImageInput" accept="image/*" style="display: none;" onchange="previewImage(this, 'vendedorImagePreview')">
                            <div id="vendedorImagePreview">
                                <p>📷 Clique para adicionar uma imagem</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="vendedorPreco">Preço (R$)</label>
                        <input type="number" id="vendedorPreco" name="preco" step="0.01" placeholder="0,00" required>
                    </div>
                </div>
                
                <div class="ean-codes-container">
                    <h3>Códigos EAN</h3>
                    <div id="vendedorEanCodesContainer">
                        <div class="ean-code-item">
                            <input type="text" name="eanCodes[]" placeholder="Código EAN" required>
                            <button type="button" class="remove-ean-btn" onclick="removeEanCode(this)" style="display: none;">×</button>
                        </div>
                    </div>
                    <button type="button" class="add-ean-btn" onclick="addEanCode('vendedor')">+ Adicionar Código EAN</button>
                </div>
                
                <div class="expiry-dates-container">
                    <h3>Datas de Validade e Quantidades</h3>
                    <div id="expiryDatesContainer">
                        <div class="expiry-date-item">
                            <div class="date-input-wrapper">
                                <input type="text" class="date-input" name="dataValidade[]" placeholder="DD/MM/AAAA" required>
                            </div>
                            <input type="number" name="quantidade[]" placeholder="Quantidade" min="1" required>
                            <button type="button" class="remove-expiry-btn" onclick="removeExpiryDate(this)" style="display: none;">×</button>
                        </div>
                    </div>
                    <button type="button" class="add-expiry-btn" onclick="addExpiryDate()">+ Adicionar Data de Validade</button>
                </div>
                
                <div class="form-buttons">
                    <button type="button" class="back-to-dashboard-btn" onclick="showVendedorSection('home')">← Voltar</button>
                    <button type="button" class="delete-button-form" id="vendedorDeleteBtn" onclick="confirmDeleteProduct('vendedor')" style="display: none;">EXCLUIR</button>
                    <button type="submit" class="submit-button-form" id="vendedorSubmitBtn">CADASTRAR PRODUTO</button>
                </div>
            </form>
        </div>
    `;
}

function setupFormEventListeners(userType) {
    // Configurar event listeners específicos do formulário após carregar
    if (userType === 'fornecedor') {
        setupFornecedorFormListeners();
    } else if (userType === 'vendedor') {
        setupVendedorFormListeners();
    }
}

function setupFornecedorFormListeners() {
    // Envio do formulário de produto - Fornecedor
    const fornecedorForm = document.getElementById('fornecedorForm');
    if (fornecedorForm) {
        fornecedorForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const productId = formData.get('productId');
            const isEditing = productId && productId !== '';

            // Capturar códigos EAN
            const eanCodes = formData.getAll('eanCodes[]');
            
            // Validar se há pelo menos um EAN
            if (eanCodes.length === 0 || eanCodes.some(ean => ean.trim() === '')) {
                alert('Por favor, adicione pelo menos um código EAN válido');
                return;
            }

            // Capturar imagem se houver
            const imageFile = document.getElementById('fornecedorImageInput').files[0];
            let imageUrl = '';
            
            if (imageFile) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    imageUrl = e.target.result;
                    saveOrUpdateFornecedorProduct(formData, eanCodes, isEditing, parseInt(productId), imageUrl);
                };
                reader.readAsDataURL(imageFile);
            } else {
                // Se está editando, manter a imagem existente
                if (isEditing) {
                    const existingProduct = fornecedorProducts.find(p => p.id === parseInt(productId));
                    imageUrl = existingProduct ? existingProduct.image : '';
                }
                saveOrUpdateFornecedorProduct(formData, eanCodes, isEditing, parseInt(productId), imageUrl);
            }
        });
    }
}

function setupVendedorFormListeners() {
    // Envio do formulário de produto - Vendedor
    const vendedorForm = document.getElementById('vendedorForm');
    if (vendedorForm) {
        vendedorForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const productId = formData.get('productId');
            const isEditing = productId && productId !== '';
            
            // Capturar códigos EAN
            const eanCodes = formData.getAll('eanCodes[]');
            
            // Validar se há pelo menos um EAN
            if (eanCodes.length === 0 || eanCodes.some(ean => ean.trim() === '')) {
                alert('Por favor, adicione pelo menos um código EAN válido');
                return;
            }
            
            // Processar datas de validade e quantidades
            const datasValidade = formData.getAll('dataValidade[]');
            const quantidades = formData.getAll('quantidade[]');
            
            // Validar todas as datas ANTES de prosseguir
            let invalidDates = [];
            datasValidade.forEach((date, index) => {
                if (!isValidDate(date.trim())) {
                    invalidDates.push(`Data ${index + 1}: "${date}"`);
                }
            });
            
            if (invalidDates.length > 0) {
                let errorMessage = 'As seguintes datas estão inválidas:\n\n';
                errorMessage += invalidDates.join('\n');
                errorMessage += '\n\nPor favor, corrija as datas no formato DD/MM/AAAA';
                
                alert(errorMessage);
                
                // Destacar campos com erro
                const dateInputs = document.querySelectorAll('.date-input');
                dateInputs.forEach((input, index) => {
                    if (!isValidDate(input.value.trim())) {
                        input.style.borderColor = '#dc3545';
                        input.style.backgroundColor = '#f8d7da';
                    }
                });
                
                return;
            }

            // Mostrar aviso especial para múltiplas datas
            if (datasValidade.length > 1) {
                const confirmMessage = `⚠️ ATENÇÃO: Você está cadastrando um produto com ${datasValidade.length} datas de validade diferentes.\n\n` +
                                     `Isso significa que o controle de estoque nas vendas será MANUAL. ` +
                                     `O sistema não conseguirá atualizar automaticamente as quantidades por data.\n\n` +
                                     `Deseja continuar mesmo assim?`;
                
                if (!confirm(confirmMessage)) {
                    return;
                }
            }

            // Capturar imagem se houver
            const imageFile = document.getElementById('vendedorImageInput').files[0];
            let imageUrl = '';
            
            if (imageFile) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    imageUrl = e.target.result;
                    saveOrUpdateVendedorProduct(formData, eanCodes, datasValidade, quantidades, isEditing, parseInt(productId), imageUrl);
                };
                reader.readAsDataURL(imageFile);
            } else {
                // Se está editando, manter a imagem existente
                if (isEditing) {
                    const existingProduct = vendedorProducts.find(p => p.id === parseInt(productId));
                    imageUrl = existingProduct ? existingProduct.image : '';
                }
                saveOrUpdateVendedorProduct(formData, eanCodes, datasValidade, quantidades, isEditing, parseInt(productId), imageUrl);
            }
        });
    }

    // Aplicar máscara aos campos de data existentes
    const dateInputs = document.querySelectorAll('.date-input');
    dateInputs.forEach(input => applyDateMask(input));
    
    // Inicializar validação melhorada
    setupImprovedDateValidation();
    
    // Verificar avisos iniciais
    updateExpiryWarnings();
}

// Função de pesquisa
function searchProducts(searchTerm, userType) {
    currentSearchTerm = searchTerm.toLowerCase().trim();
    
    if (userType === 'fornecedor') {
        renderFornecedorProducts();
    } else if (userType === 'vendedor') {
        renderVendedorProducts();
    }
}

// Filtrar produtos baseado no termo de pesquisa
function filterProducts(products, searchTerm) {
    if (!searchTerm) return products;
    
    return products.filter(product => {
        // Buscar por nome do produto
        const nameMatch = product.nomeProduto.toLowerCase().includes(searchTerm);
        
        // Buscar por código EAN
        const eanMatch = product.eanCodes.some(ean => 
            ean.toLowerCase().includes(searchTerm)
        );
        
        return nameMatch || eanMatch;
    });
}

// Configurar event listeners para as barras de pesquisa
function setupSearchListeners() {
    const fornecedorSearchInput = document.getElementById('fornecedorSearchInput');
    const vendedorSearchInput = document.getElementById('vendedorSearchInput');

    if (fornecedorSearchInput) {
        fornecedorSearchInput.addEventListener('input', function(e) {
            searchProducts(e.target.value, 'fornecedor');
        });
    }

    if (vendedorSearchInput) {
        vendedorSearchInput.addEventListener('input', function(e) {
            searchProducts(e.target.value, 'vendedor');
        });
    }
}

// Preview de imagem
function previewImage(input, previewId) {
    const file = input.files[0];
    const previewContainer = document.getElementById(previewId);
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            previewContainer.innerHTML = `
                <img src="${e.target.result}" alt="Preview" class="image-preview">
                <p>✓ Imagem selecionada</p>
            `;
            previewContainer.parentElement.classList.add('has-image');
        };
        reader.readAsDataURL(file);
    }
}

// Funções para códigos EAN
function addEanCode(userType) {
    const containerId = userType === 'fornecedor' ? 'fornecedorEanCodesContainer' : 'vendedorEanCodesContainer';
    const container = document.getElementById(containerId);
    const newItem = document.createElement('div');
    newItem.className = 'ean-code-item';
    newItem.innerHTML = `
        <input type="text" name="eanCodes[]" placeholder="Código EAN" required>
        <button type="button" class="remove-ean-btn" onclick="removeEanCode(this)">×</button>
    `;
    container.appendChild(newItem);
    updateEanButtons(containerId);
}

function removeEanCode(button) {
    const container = button.parentElement.parentElement;
    if (container.children.length > 1) {
        button.parentElement.remove();
        updateEanButtons(container.id);
    }
}

function updateEanButtons(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        const items = container.children;
        for (let i = 0; i < items.length; i++) {
            const removeBtn = items[i].querySelector('.remove-ean-btn');
            if (removeBtn) {
                removeBtn.style.display = items.length > 1 ? 'flex' : 'none';
            }
        }
    }
}

// Funções para datas de validade (vendedor)
function addExpiryDate() {
    const container = document.getElementById('expiryDatesContainer');
    const newItem = document.createElement('div');
    newItem.className = 'expiry-date-item';
    
    // Verificar se já há mais de uma data - adicionar aviso laranja
    const currentItems = container.children.length;
    if (currentItems >= 1) {
        newItem.classList.add('has-warning');
    }
    
    newItem.innerHTML = `
        <div class="date-input-wrapper">
            <input type="text" class="date-input" name="dataValidade[]" placeholder="DD/MM/AAAA" required>
        </div>
        <input type="number" name="quantidade[]" placeholder="Quantidade" min="1" required>
        <button type="button" class="remove-expiry-btn" onclick="removeExpiryDate(this)">×</button>
    `;
    container.appendChild(newItem);
    
    // Aplicar máscara de data ao novo campo
    applyDateMask(newItem.querySelector('.date-input'));
    updateExpiryButtons();
    
    // Adicionar classe de aviso a todos os itens se houver mais de 1
    updateExpiryWarnings();
}

function removeExpiryDate(button) {
    const container = document.getElementById('expiryDatesContainer');
    if (container.children.length > 1) {
        button.parentElement.remove();
        updateExpiryButtons();
        updateExpiryWarnings();
    }
}

function updateExpiryWarnings() {
    const container = document.getElementById('expiryDatesContainer');
    const items = container.children;
    
    // Se há mais de um item, adicionar classe de aviso a todos
    for (let i = 0; i < items.length; i++) {
        if (items.length > 1) {
            items[i].classList.add('has-warning');
        } else {
            items[i].classList.remove('has-warning');
        }
    }
    let generalWarning = container.parentElement.querySelector('.general-expiry-warning');
    
    if (items.length > 1 && !generalWarning) {
        generalWarning = document.createElement('div');
        generalWarning.className = 'general-expiry-warning';
        generalWarning.innerHTML = `
            <div style="background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); color: white; padding: 12px 15px; border-radius: 8px; margin-bottom: 15px; font-weight: bold; display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 18px;">⚠️</span>
                <span>Atenção: Produto com múltiplas datas de validade. Isso requer controle manual do estoque nas vendas.</span>
            </div>
        `;
        container.parentElement.insertBefore(generalWarning, container);
    } else if (items.length === 1 && generalWarning) {
        generalWarning.remove();
    }
}

function updateExpiryButtons() {
    const container = document.getElementById('expiryDatesContainer');
    if (container) {
        const items = container.children;
        for (let i = 0; i < items.length; i++) {
            const removeBtn = items[i].querySelector('.remove-expiry-btn');
            if (removeBtn) {
                removeBtn.style.display = items.length > 1 ? 'flex' : 'none';
            }
        }
    }
}

// Máscara para data DD/MM/AAAA
function applyDateMask(input) {
    let hasShownAlert = false;
    
    input.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2);
        }
        if (value.length >= 5) {
            value = value.substring(0, 5) + '/' + value.substring(5);
        }
        if (value.length > 10) {
            value = value.substring(0, 10);
        }
        
        e.target.value = value;
        
        if (!hasShownAlert) {
            e.target.style.borderColor = '#ddd';
        }
    });

    input.addEventListener('blur', function(e) {
        const value = e.target.value.trim();
        
        if (!value) {
            e.target.style.borderColor = '#ddd';
            hasShownAlert = false;
            return;
        }
        
        if (value && !isValidDate(value) && !hasShownAlert) {
            e.target.style.borderColor = '#dc3545';
            hasShownAlert = true;
            
            setTimeout(() => {
                alert('Por favor, insira uma data válida no formato DD/MM/AAAA');
            }, 100);
        } else if (isValidDate(value)) {
            e.target.style.borderColor = '#28a745';
            hasShownAlert = false;
        }
    });
    
    input.addEventListener('focus', function(e) {
        if (hasShownAlert) {
            hasShownAlert = false;
            e.target.style.borderColor = '#007bff';
        }
    });
}

function isValidDate(dateString) {
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = dateString.match(regex);
    
    if (!match) return false;
    
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);
    
    // Validações básicas
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    if (year < 2024 || year > 9999) return false;
    
    // Verificar dias válidos por mês
    const daysInMonth = new Date(year, month, 0).getDate();
    if (day > daysInMonth) return false;
    
    const inputDate = new Date(year, month - 1, day);
    const minDate = new Date(2024, 0, 1);
    const maxDate = new Date(9999, 11, 31);
    
    return inputDate >= minDate && inputDate <= maxDate;
}

function setupImprovedDateValidation() {
    document.addEventListener('input', function(e) {
        if (e.target.classList.contains('date-input')) {
            const value = e.target.value;
            
            if (value.length === 10) {
                if (isValidDate(value)) {
                    e.target.style.borderColor = '#28a745';
                    e.target.style.backgroundColor = '#f8fff8';
                } else {
                    e.target.style.borderColor = '#ffc107';
                    e.target.style.backgroundColor = '#fffdf0';
                }
            } else if (value.length > 0) {
                e.target.style.borderColor = '#007bff';
                e.target.style.backgroundColor = '#f0f8ff';
            } else {
                e.target.style.borderColor = '#ddd';
                e.target.style.backgroundColor = 'white';
            }
        }
    });
}

// Navegação dos dashboards
function showFornecedorSection(section) {
    const content = document.getElementById('fornecedorContent');
    const productForm = document.getElementById('fornecedorProductForm');
    const logo = content.querySelector('.dashboard-logo');
    const productsList = document.getElementById('fornecedorProductsList');
    const searchContainer = document.getElementById('fornecedorSearchContainer');
    
    // Atualizar navegação
    document.querySelectorAll('#fornecedorDashboard .nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-section') === section) {
            btn.classList.add('active');
        }
    });

    // Esconder tudo primeiro
    if (logo) logo.style.display = 'none';
    productsList.classList.remove('show');
    if (productForm) productForm.style.display = 'none';
    searchContainer.classList.remove('show');

    if (section === 'novo-produto') {
        if (productForm) {
            productForm.style.display = 'block';
            resetFornecedorForm();
        }
    } else if (section === 'home') {
        if (fornecedorProducts.length === 0) {
            if (logo) logo.style.display = 'block';
        } else {
            searchContainer.classList.add('show');
            productsList.classList.add('show');
            renderFornecedorProducts();
        }
    } else {
        if (logo) logo.style.display = 'block';
    }

    // Limpar pesquisa ao trocar de seção
    const searchInput = document.getElementById('fornecedorSearchInput');
    if (searchInput) {
        searchInput.value = '';
        currentSearchTerm = '';
    }
}

function showVendedorSection(section) {
    const content = document.getElementById('vendedorContent');
    const productForm = document.getElementById('vendedorProductForm');
    const logo = content.querySelector('.dashboard-logo');
    const productsList = document.getElementById('vendedorProductsList');
    const searchContainer = document.getElementById('vendedorSearchContainer');
    const salesInterface = document.getElementById('salesInterface');
    const reportsInterface = document.getElementById('reportsInterface');
    
    // Atualizar navegação
    document.querySelectorAll('#vendedorDashboard .nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-section') === section) {
            btn.classList.add('active');
        }
    });

    // Esconder tudo primeiro
    if (logo) logo.style.display = 'none';
    productsList.classList.remove('show');
    if (productForm) productForm.style.display = 'none';
    searchContainer.classList.remove('show');
    if (salesInterface) salesInterface.style.display = 'none';
    if (reportsInterface) reportsInterface.style.display = 'none';
    
    // CORREÇÃO: Desativar sistema de relatórios se estiver ativo
    if (window.reportsSystem && window.reportsSystem.isActive && section !== 'relatorio') {
        window.reportsSystem.isActive = false; // Adicione esta linha
    }
    
    if (section === 'novo-produto') {
        if (productForm) {
            productForm.style.display = 'block';
            resetVendedorForm();
        }
    } else if (section === 'vendas') {
        if (!vendedorProducts || vendedorProducts.length === 0) {
            alert('Você precisa cadastrar produtos primeiro antes de fazer vendas!');
            // Voltar para home
            document.querySelectorAll('#vendedorDashboard .nav-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.getAttribute('data-section') === 'home') {
                    btn.classList.add('active');
                }
            });
            if (logo) logo.style.display = 'block';
            return;
        }
        
        if (window.salesSystem) {
            window.salesSystem.showSalesInterface();
        }
    } else if (section === 'relatorio') {
        if (window.reportsSystem) {
            window.reportsSystem.showReportsInterface();
        }
    } else if (section === 'home') {
        if (vendedorProducts.length === 0) {
            if (logo) logo.style.display = 'block';
        } else {
            searchContainer.classList.add('show');
            productsList.classList.add('show');
            renderVendedorProducts();
            
            if (window.ExpiryAlerts) {
                setTimeout(() => {
                    window.ExpiryAlerts.checkAndAlertExpiry();
                    updateExpiryButtonCounter();
                }, 500);
            }
        }
    } else {
        if (logo) logo.style.display = 'block';
    }

    // Limpar pesquisa ao trocar de seção (apenas se não for seção de vendas)
    if (section !== 'vendas') {
        const searchInput = document.getElementById('vendedorSearchInput');
        if (searchInput) {
            searchInput.value = '';
            currentSearchTerm = '';
        }

        const clearFilterBtn = document.getElementById('clearFilterBtn');
        if (clearFilterBtn) {
            clearFilterBtn.remove();
        }
    }
}
// Renderizar produtos do fornecedor
function renderFornecedorProducts() {
    const container = document.getElementById('fornecedorProductsList');
    const searchInfo = document.getElementById('fornecedorSearchInfo');
    
    if (fornecedorProducts.length === 0) {
        container.innerHTML = '<div class="no-products">Nenhum produto cadastrado ainda</div>';
        searchInfo.innerHTML = '';
        return;
    }

    // Filtrar produtos baseado na pesquisa
    const filteredProducts = filterProducts(fornecedorProducts, currentSearchTerm);
    
    // Atualizar informações da pesquisa
    if (currentSearchTerm) {
        if (filteredProducts.length === 0) {
            searchInfo.innerHTML = `Nenhum produto encontrado para "${currentSearchTerm}"`;
        } else {
            searchInfo.innerHTML = `${filteredProducts.length} produto(s) encontrado(s) para "${currentSearchTerm}"`;
        }
    } else {
        searchInfo.innerHTML = `Exibindo ${filteredProducts.length} produto(s)`;
    }

    if (filteredProducts.length === 0) {
        container.innerHTML = '<div class="no-products">Nenhum produto encontrado</div>';
        return;
    }

    // Ordenar por ordem alfabética
    const sortedProducts = [...filteredProducts].sort((a, b) => 
        a.nomeProduto.toLowerCase().localeCompare(b.nomeProduto.toLowerCase())
    );

    container.innerHTML = sortedProducts.map(product => `
        <div class="product-card" onclick="editFornecedorProduct(${product.id})">
            <div class="product-image">
                ${product.image ? `<img src="${product.image}" alt="${product.nomeProduto}">` : ''}
            </div>
            <div class="product-name">${product.nomeProduto}</div>
            <div class="product-info">EAN: ${product.eanCodes.join(', ')}</div>
            <div class="product-info">Validade: ${product.validadeDias} dias</div>
            ${product.calorias ? `<div class="product-info">Calorias: ${product.calorias} kcal/100g</div>` : ''}
        </div>
    `).join('');
}

// Renderizar produtos do vendedor
function renderVendedorProducts() {
    const container = document.getElementById('vendedorProductsList');
    const searchInfo = document.getElementById('vendedorSearchInfo');
    
    if (vendedorProducts.length === 0) {
        container.innerHTML = '<div class="no-products">Nenhum produto cadastrado ainda</div>';
        searchInfo.innerHTML = '';
        return;
    }

    // Filtrar produtos baseado na pesquisa
    const filteredProducts = filterProducts(vendedorProducts, currentSearchTerm);
    
    // Atualizar informações da pesquisa
    if (currentSearchTerm) {
        if (filteredProducts.length === 0) {
            searchInfo.innerHTML = `Nenhum produto encontrado para "${currentSearchTerm}"`;
        } else {
            searchInfo.innerHTML = `${filteredProducts.length} produto(s) encontrado(s) para "${currentSearchTerm}"`;
        }
    } else {
        // Contar produtos próximos do vencimento
        if (window.ExpiryAlerts) {
            const { expiringProducts, expiredProducts } = window.ExpiryAlerts.checkExpiringProducts();
            const alertCount = expiringProducts.length + expiredProducts.length;
            
            let infoText = `Exibindo ${filteredProducts.length} produto(s)`;
            if (alertCount > 0) {
                infoText += ` | ${alertCount} produto(s) próximo(s) do vencimento`;
            }
            searchInfo.innerHTML = infoText;
            
            if (alertCount > 0) {
                searchInfo.style.color = '#dc3545';
                searchInfo.style.fontWeight = 'bold';
            } else {
                searchInfo.style.color = '#666';
                searchInfo.style.fontWeight = 'normal';
            }
        } else {
            searchInfo.innerHTML = `Exibindo ${filteredProducts.length} produto(s)`;
        }
    }

    if (filteredProducts.length === 0) {
        container.innerHTML = '<div class="no-products">Nenhum produto encontrado</div>';
        return;
    }

    // Ordenar por ordem alfabética
    const sortedProducts = [...filteredProducts].sort((a, b) => 
        a.nomeProduto.toLowerCase().localeCompare(b.nomeProduto.toLowerCase())
    );

    container.innerHTML = sortedProducts.map(product => {
        let earliestExpiry = null;
        let alertStatus = 'valid';
        let alertBadge = '';
        let cardClass = 'product-card';
        let expiryInfo = '';
        
        // Verificar status de vencimento para cada produto
        if (window.ExpiryAlerts) {
            product.validades.forEach(validade => {
                const status = window.ExpiryAlerts.getExpiryStatus(validade.data);
                if (status.status !== 'valid') {
                    if (!earliestExpiry || status.daysUntilExpiry < earliestExpiry.daysUntilExpiry) {
                        earliestExpiry = status;
                        alertStatus = status.status;
                    }
                }
            });
            
            if (alertStatus === 'expired') {
                alertBadge = '<div class="expiry-badge expired">VENCIDO</div>';
                cardClass += ' expired-product';
                expiryInfo = `<div class="expiry-info">${earliestExpiry.message}</div>`;
            } else if (alertStatus === 'expires-today') {
                alertBadge = '<div class="expiry-badge expires-today">VENCE HOJE</div>';
                cardClass += ' expires-today-product';
                expiryInfo = `<div class="expiry-info">${earliestExpiry.message}</div>`;
            } else if (alertStatus === 'expiring-soon') {
                alertBadge = '<div class="expiry-badge expiring-soon">PRÓXIMO AO VENCIMENTO</div>';
                cardClass += ' expiring-soon-product';
                expiryInfo = `<div class="expiry-info">${earliestExpiry.message}</div>`;
            }
        }
        
        return `
            <div class="${cardClass}" onclick="editVendedorProduct(${product.id})">
                ${alertBadge}
                <div class="product-image">
                    ${product.image ? `<img src="${product.image}" alt="${product.nomeProduto}">` : ''}
                </div>
                <div class="product-name">${product.nomeProduto}</div>
                <div class="product-info">EAN: ${product.eanCodes.join(', ')}</div>
                <div class="product-price">R$ ${parseFloat(product.preco).toFixed(2)}</div>
                <div class="product-info">${product.validades.length} data(s) de validade</div>
                ${expiryInfo}
            </div>
        `;
    }).join('');
    
    // Adicionar labels de controle de estoque após renderizar
    setTimeout(() => {
        sortedProducts.forEach((product, index) => {
            const cards = container.querySelectorAll('.product-card');
            if (cards[index] && window.addInventoryLabelsToProductCard) {
                window.addInventoryLabelsToProductCard(product, cards[index]);
            }
        });
    }, 100);
}

// Editar produto do fornecedor
function editFornecedorProduct(productId) {
    const product = fornecedorProducts.find(p => p.id === productId);
    if (!product) return;

    // Preencher o formulário com os dados do produto
    document.getElementById('fornecedorProductId').value = product.id;
    document.getElementById('fornecedorNomeProduto').value = product.nomeProduto;
    document.getElementById('fornecedorValidadeDias').value = product.validadeDias;
    document.getElementById('valorEnergetico').value = product.valorEnergetico || '';
    document.getElementById('acucares').value = product.acucares || '';  

    // Valores nutricionais
    document.getElementById('calorias').value = product.calorias || '';
    document.getElementById('carboidratos').value = product.carboidratos || '';
    document.getElementById('proteinas').value = product.proteinas || '';
    document.getElementById('gorduras').value = product.gorduras || '';
    document.getElementById('fibras').value = product.fibras || '';
    document.getElementById('sodio').value = product.sodio || '';

    // Códigos EAN
    const eanContainer = document.getElementById('fornecedorEanCodesContainer');
    eanContainer.innerHTML = '';
    
    product.eanCodes.forEach((ean, index) => {
        const newItem = document.createElement('div');
        newItem.className = 'ean-code-item';
        newItem.innerHTML = `
            <input type="text" name="eanCodes[]" placeholder="Código EAN" value="${ean}" required>
            <button type="button" class="remove-ean-btn" onclick="removeEanCode(this)">×</button>
        `;
        eanContainer.appendChild(newItem);
    });

    updateEanButtons('fornecedorEanCodesContainer');

    // Imagem
    if (product.image) {
        document.getElementById('fornecedorImagePreview').innerHTML = `
            <img src="${product.image}" alt="Preview" class="image-preview">
            <p>✓ Imagem atual</p>
        `;
        document.querySelector('#fornecedorProductForm .image-upload-area').classList.add('has-image');
    }

    // Alterar título e botões
    document.getElementById('fornecedorFormTitle').textContent = 'Editar Produto';
    document.getElementById('fornecedorSubmitBtn').textContent = 'ATUALIZAR PRODUTO';
    document.getElementById('fornecedorDeleteBtn').style.display = 'block';

    // Esconder lista e logo, mostrar formulário
    const logo = document.querySelector('#fornecedorContent .dashboard-logo');
    const productsList = document.getElementById('fornecedorProductsList');
    const productForm = document.getElementById('fornecedorProductForm');
    const searchContainer = document.getElementById('fornecedorSearchContainer');
    
    if (logo) logo.style.display = 'none';
    productsList.classList.remove('show');
    searchContainer.classList.remove('show');
    productForm.style.display = 'block';

    // Atualizar navegação
    document.querySelectorAll('#fornecedorDashboard .nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-section') === 'novo-produto') {
            btn.classList.add('active');
        }
    });
}

// Editar produto do vendedor
function editVendedorProduct(productId) {
    const product = vendedorProducts.find(p => p.id === productId);
    if (!product) return;

    // Preencher o formulário com os dados do produto
    document.getElementById('vendedorProductId').value = product.id;
    document.getElementById('vendedorNomeProduto').value = product.nomeProduto;
    document.getElementById('vendedorPreco').value = product.preco;

    // Códigos EAN
    const eanContainer = document.getElementById('vendedorEanCodesContainer');
    eanContainer.innerHTML = '';
    
    product.eanCodes.forEach((ean, index) => {
        const newItem = document.createElement('div');
        newItem.className = 'ean-code-item';
        newItem.innerHTML = `
            <input type="text" name="eanCodes[]" placeholder="Código EAN" value="${ean}" required>
            <button type="button" class="remove-ean-btn" onclick="removeEanCode(this)">×</button>
        `;
        eanContainer.appendChild(newItem);
    });

    updateEanButtons('vendedorEanCodesContainer');

    // Imagem
    if (product.image) {
        document.getElementById('vendedorImagePreview').innerHTML = `
            <img src="${product.image}" alt="Preview" class="image-preview">
            <p>✓ Imagem atual</p>
        `;
        document.querySelector('#vendedorProductForm .image-upload-area').classList.add('has-image');
    }

    // Datas de validade
    const container = document.getElementById('expiryDatesContainer');
    container.innerHTML = '';
    
    product.validades.forEach((validade, index) => {
        const newItem = document.createElement('div');
        newItem.className = 'expiry-date-item';
        newItem.innerHTML = `
            <div class="date-input-wrapper">
                <input type="text" class="date-input" name="dataValidade[]" placeholder="DD/MM/AAAA" value="${validade.data}" required>
            </div>
            <input type="number" name="quantidade[]" placeholder="Quantidade" min="1" value="${validade.quantidade}" required>
            <button type="button" class="remove-expiry-btn" onclick="removeExpiryDate(this)">×</button>
        `;
        container.appendChild(newItem);
        
        // Aplicar máscara de data
        applyDateMask(newItem.querySelector('.date-input'));
    });

    updateExpiryButtons();

    // Alterar título e botões
    document.getElementById('vendedorFormTitle').textContent = 'Editar Produto';
    document.getElementById('vendedorSubmitBtn').textContent = 'ATUALIZAR PRODUTO';
    document.getElementById('vendedorDeleteBtn').style.display = 'block';

    // Esconder lista e logo, mostrar formulário
    const logo = document.querySelector('#vendedorContent .dashboard-logo');
    const productsList = document.getElementById('vendedorProductsList');
    const productForm = document.getElementById('vendedorProductForm');
    const searchContainer = document.getElementById('vendedorSearchContainer');
    
    if (logo) logo.style.display = 'none';
    productsList.classList.remove('show');
    searchContainer.classList.remove('show');
    productForm.style.display = 'block';

    // Atualizar navegação
    document.querySelectorAll('#vendedorDashboard .nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-section') === 'novo-produto') {
            btn.classList.add('active');
        }
    });
}

// Reset do formulário do fornecedor
function resetFornecedorForm() {
    const form = document.getElementById('fornecedorForm');
    if (form) {
        form.reset();
        document.getElementById('fornecedorProductId').value = '';
        document.getElementById('fornecedorImagePreview').innerHTML = '<p>📷 Clique para adicionar uma imagem</p>';
        document.querySelector('#fornecedorProductForm .image-upload-area').classList.remove('has-image');
        
        // Reset EAN code
        const eanContainer = document.getElementById('fornecedorEanCodesContainer');
        eanContainer.innerHTML = `
            <div class="ean-code-item">
                <input type="text" name="eanCodes[]" placeholder="Código EAN" required>
                <button type="button" class="remove-ean-btn" onclick="removeEanCode(this)" style="display: none;">×</button>
            </div>
        `;
        
        document.getElementById('fornecedorFormTitle').textContent = 'Cadastrar Novo Produto';
        document.getElementById('fornecedorSubmitBtn').textContent = 'CADASTRAR PRODUTO';
        document.getElementById('fornecedorDeleteBtn').style.display = 'none';
    }
}

// Reset do formulário do vendedor
function resetVendedorForm() {
    const form = document.getElementById('vendedorForm');
    if (form) {
        form.reset();
        document.getElementById('vendedorProductId').value = '';
        document.getElementById('vendedorImagePreview').innerHTML = '<p>📷 Clique para adicionar uma imagem</p>';
        document.querySelector('#vendedorProductForm .image-upload-area').classList.remove('has-image');
        
        // Reset EAN codes 
        const eanContainer = document.getElementById('vendedorEanCodesContainer');
        eanContainer.innerHTML = `
            <div class="ean-code-item">
                <input type="text" name="eanCodes[]" placeholder="Código EAN" required>
                <button type="button" class="remove-ean-btn" onclick="removeEanCode(this)" style="display: none;">×</button>
            </div>
        `;
        
        // Reset expiry dates container
        const container = document.getElementById('expiryDatesContainer');
        container.innerHTML = `
            <div class="expiry-date-item">
                <div class="date-input-wrapper">
                    <input type="text" class="date-input" name="dataValidade[]" placeholder="DD/MM/AAAA" required>
                </div>
                <input type="number" name="quantidade[]" placeholder="Quantidade" min="1" required>
                <button type="button" class="remove-expiry-btn" onclick="removeExpiryDate(this)" style="display: none;">×</button>
            </div>
        `;
        
        // Aplicar máscara ao campo resetado
        applyDateMask(container.querySelector('.date-input'));

        document.getElementById('vendedorFormTitle').textContent = 'Cadastrar Novo Produto';
        document.getElementById('vendedorSubmitBtn').textContent = 'CADASTRAR PRODUTO';
        document.getElementById('vendedorDeleteBtn').style.display = 'none';
    }
}

// Confirmar exclusão de produto
function confirmDeleteProduct(userType) {
    currentEditingUserType = userType;
    const productId = userType === 'fornecedor' ? 
        document.getElementById('fornecedorProductId').value :
        document.getElementById('vendedorProductId').value;
    
    if (productId) {
        currentEditingProductId = parseInt(productId);
        document.getElementById('deleteModal').style.display = 'block';
    }
}

// Fechar modal de exclusão
function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
    currentEditingProductId = null;
    currentEditingUserType = null;
}

// Excluir produto
function deleteProduct() {
    if (currentEditingProductId && currentEditingUserType) {
        if (currentEditingUserType === 'fornecedor') {
            fornecedorProducts = fornecedorProducts.filter(p => p.id !== currentEditingProductId);
            showFornecedorSection('home');
        } else {
            vendedorProducts = vendedorProducts.filter(p => p.id !== currentEditingProductId);
            showVendedorSection('home');
        }
        
        closeDeleteModal();
        alert('Produto excluído com sucesso!');
    }
}

function saveOrUpdateFornecedorProduct(formData, eanCodes, isEditing, productId, imageUrl) {
    const productData = {
        id: isEditing ? productId : Date.now(),
        nomeProduto: formData.get('nomeProduto'),
        validadeDias: parseInt(formData.get('validadeDias')),
        eanCodes: eanCodes,
        calorias: parseFloat(formData.get('calorias')) || null,
        carboidratos: parseFloat(formData.get('carboidratos')) || null,
        proteinas: parseFloat(formData.get('proteinas')) || null,
        gorduras: parseFloat(formData.get('gorduras')) || null,
        fibras: parseFloat(formData.get('fibras')) || null,
        sodio: parseFloat(formData.get('sodio')) || null,
        valorEnergetico: parseFloat(formData.get('valorEnergetico')) || null,
        acucares: parseFloat(formData.get('acucares')) || null,
        image: imageUrl
    };

    if (isEditing) {
        // Atualizar produto existente
        const index = fornecedorProducts.findIndex(p => p.id === productId);
        if (index !== -1) {
            fornecedorProducts[index] = productData;
            alert('Produto atualizado com sucesso!');
        }
    } else {
        // Adicionar novo produto
        fornecedorProducts.push(productData);
        alert('Produto cadastrado com sucesso!');
    }

    console.log('Produto Fornecedor:', productData);
    showFornecedorSection('home');
}

function saveOrUpdateVendedorProduct(formData, eanCodes, datasValidade, quantidades, isEditing, productId, imageUrl) {
    const validadeInfo = datasValidade.map((data, index) => ({
        data: data,
        quantidade: parseInt(quantidades[index])
    }));

    const productData = {
        id: isEditing ? productId : Date.now(),
        nomeProduto: formData.get('nomeProduto'),
        preco: parseFloat(formData.get('preco')),
        eanCodes: eanCodes,
        validades: validadeInfo,
        image: imageUrl
    };

    if (isEditing) {
        const index = vendedorProducts.findIndex(p => p.id === productId);
        if (index !== -1) {
            vendedorProducts[index] = productData;
            alert('Produto atualizado com sucesso!');
        }
    } else {
        vendedorProducts.push(productData);
        alert('Produto cadastrado com sucesso!');
    }

    console.log('Produto Vendedor:', productData);
    console.log('Array após salvar:', vendedorProducts);
    
    // Atualizar a variável global do sistema de vendas
    if (window.vendedorProducts) {
        window.vendedorProducts = vendedorProducts;
    }
    
    showVendedorSection('home');
    
    // Atualizar contador após salvar
    setTimeout(() => {
        updateExpiryButtonCounter();
    }, 500);
}

function updateExpiryButtonCounter() {
    const expiryBtn = document.getElementById('expiryCheckBtn');
    if (!expiryBtn || !window.ExpiryAlerts) return;
    
    const { expiringProducts, expiredProducts } = window.ExpiryAlerts.checkExpiringProducts();
    const totalAlerts = expiringProducts.length + expiredProducts.length;
    
    if (totalAlerts > 0) {
        expiryBtn.innerHTML = `⚠️ Vencimentos (${totalAlerts})`;
        expiryBtn.style.background = '#dc3545';
        expiryBtn.style.color = 'white';
        expiryBtn.style.animation = 'buttonPulse 2s infinite';
    } else {
        expiryBtn.innerHTML = '✅ Vencimentos';
        expiryBtn.style.background = '#28a745';
        expiryBtn.style.color = 'white';
        expiryBtn.style.animation = 'none';
    }
}

function addExpiryCheckButton() {
    const searchContainer = document.getElementById('vendedorSearchContainer');
    if (searchContainer && !document.getElementById('expiryCheckBtn')) {
        const expiryBtn = document.createElement('button');
        expiryBtn.id = 'expiryCheckBtn';
        expiryBtn.innerHTML = '⚠️ Verificar Vencimentos';
        expiryBtn.className = 'expiry-check-btn';
        expiryBtn.style.cssText = `
            background: #ffc107;
            color: #333;
            border: none;
            padding: 10px 20px;
            border-radius: 20px;
            margin: 10px auto;
            display: block;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.3s ease;
        `;
        
        expiryBtn.onclick = function() {
            if (window.ExpiryAlerts) {
                window.ExpiryAlerts.applyExpiryFilter();
            }
        };
        
        expiryBtn.onmouseover = function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
        };
        
        expiryBtn.onmouseout = function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        };
        
        searchContainer.appendChild(expiryBtn);
    }
}

// Event listeners principais
document.addEventListener('DOMContentLoaded', function() {
    // Configurar event listeners para auth form
    const authForm = document.getElementById('authForm');
    if (authForm) {
        authForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            console.log('Dados:', data);
            console.log('Tipo de usuário:', currentUserType);
            console.log('Modo:', isLoginMode ? 'Login' : 'Cadastro');
            
            // Simular login/cadastro bem-sucedido
            document.getElementById('authScreen').style.display = 'none';
            
            if (currentUserType === 'fornecedor') {
                document.getElementById('fornecedorDashboard').style.display = 'flex';
                loadForm('fornecedor').then(() => {
                    showFornecedorSection('home');
                });
            } else {
                document.getElementById('vendedorDashboard').style.display = 'flex';
                loadForm('vendedor').then(() => {
                    showVendedorSection('home');
                });
            }
        });
    }

    // Navegação nos dashboards
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('nav-btn')) {
            const section = e.target.getAttribute('data-section');
            const dashboard = e.target.closest('.dashboard-screen');
            
            // Verificar se é seção de vendas e se há produtos
            if (section === 'vendas' && dashboard.id === 'vendedorDashboard') {
                console.log('Clicou em vendas, verificando produtos:', vendedorProducts);
                if (!vendedorProducts || vendedorProducts.length === 0) {
                    alert('Você precisa cadastrar produtos primeiro antes de fazer vendas!');
                    return;
                }
            }
            
            if (dashboard.id === 'fornecedorDashboard') {
                showFornecedorSection(section);
            } else if (dashboard.id === 'vendedorDashboard') {
                showVendedorSection(section);
            }
        }
    });

    // Fechar modal clicando fora dele
    window.onclick = function(event) {
        const modal = document.getElementById('deleteModal');
        if (event.target === modal) {
            closeDeleteModal();
        }
        
        // Fechar modais do sistema de vendas clicando fora
        const salesModals = document.querySelectorAll('.sales-modal');
        salesModals.forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    // Configurar event listeners para pesquisa
    setupSearchListeners();

    // Observer para atualizar botões
    const observer = new MutationObserver(function() {
        updateExpiryButtons();
        updateEanButtons('fornecedorEanCodesContainer');
        updateEanButtons('vendedorEanCodesContainer');
    });
    
    // Observar mudanças nos containers quando eles existirem
    setTimeout(() => {
        const expiryContainer = document.getElementById('expiryDatesContainer');
        if (expiryContainer) {
            observer.observe(expiryContainer, { childList: true });
        }
        
        const fornecedorEanContainer = document.getElementById('fornecedorEanCodesContainer');
        if (fornecedorEanContainer) {
            observer.observe(fornecedorEanContainer, { childList: true });
        }

        const vendedorEanContainer = document.getElementById('vendedorEanCodesContainer');
        if (vendedorEanContainer) {
            observer.observe(vendedorEanContainer, { childList: true });
        }
        
        // Inicializar sistema de alertas de vencimento
        if (window.ExpiryAlerts) {
            window.ExpiryAlerts.init();
        }
        addExpiryCheckButton();
        
        // Atualizar contador periodicamente
        setInterval(updateExpiryButtonCounter, 60000); // A cada minuto
        
        console.log('Sistema principal carregado!');
    }, 1000);

    // Manter arrays vazios inicialmente - NÃO redefinir no final
    console.log('Sistema inicializado - Arrays:', { fornecedorProducts, vendedorProducts });
});

// Tornar funções disponíveis globalmente para uso com o sistema de vendas
window.showVendedorSection = showVendedorSection;

// CORREÇÃO PRINCIPAL: Garantir que a variável vendedorProducts seja sempre acessível globalmente
Object.defineProperty(window, 'vendedorProducts', {
    get: function() {
        return vendedorProducts;
    },
    set: function(value) {
        vendedorProducts = value;
    }
});