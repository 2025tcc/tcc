// Sistema de atalhos melhorado integrado - VERSÃO CORRIGIDA COMPLETA
class ImprovedShortcutSystem {
    constructor() {
        this.isActive = false;
        this.shortcuts = new Map();
        this.fallbackShortcuts = new Map();
        this.setupShortcuts();
        this.exitConfirmTimeout = null;
        this.escPressCount = 0; // Contador para ESC
        this.escResetTimeout = null; // Timer para resetar contador
    }
    

    setupShortcuts() {
        // Atalhos principais (teclas F)
        this.shortcuts.set('F2', 'finalizarVenda');
        this.shortcuts.set('F5', 'adicionarMultiplos');
        this.shortcuts.set('F9', 'focarPesquisa');
        this.shortcuts.set('F10', 'aplicarDesconto');
        this.shortcuts.set('F12', 'limparCarrinho');
        this.shortcuts.set('Escape', 'sair');

        // Atalhos alternativos (Ctrl + letra)
        this.fallbackShortcuts.set('ctrl+enter', 'finalizarVenda');
        this.fallbackShortcuts.set('ctrl+m', 'adicionarMultiplos');
        this.fallbackShortcuts.set('ctrl+f', 'focarPesquisa');
        this.fallbackShortcuts.set('ctrl+d', 'aplicarDesconto');
        this.fallbackShortcuts.set('ctrl+l', 'limparCarrinho');
    }

    init() {
        this.addShortcutStyles();
        this.setupEventListeners();
        console.log('Sistema de atalhos inicializado - sem modal inicial');
    }

    setupEventListeners() {
        // Event listener principal - CORRIGIDO
        document.addEventListener('keydown', (e) => {
            if (!this.isActive) return;
            
            // Ignorar se estiver digitando em inputs (exceto ESC)
            if (e.target.tagName === 'INPUT' && e.key !== 'Escape') return;

            // Verificar teclas F primeiro
            if (this.shortcuts.has(e.key)) {
                e.preventDefault();
                e.stopPropagation();
                this.executeAction(this.shortcuts.get(e.key));
                return;
            }

            // Verificar combinações Ctrl
            const combo = this.getKeyCombo(e);
            if (this.fallbackShortcuts.has(combo)) {
                e.preventDefault();
                e.stopPropagation();
                this.executeAction(this.fallbackShortcuts.get(combo));
                return;
            }
        }, true); // IMPORTANTE: true para capturar na fase de capture

        // Listener adicional para F12 (pode ser bloqueado pelo navegador)
        window.addEventListener('keydown', (e) => {
            if (!this.isActive) return;
            
            if (e.key === 'F12') {
                e.preventDefault();
                e.stopPropagation();
                this.executeAction('limparCarrinho');
                return false;
            }
        }, true);
    }

    getKeyCombo(e) {
        const keys = [];
        if (e.ctrlKey) keys.push('ctrl');
        if (e.altKey) keys.push('alt');
        if (e.shiftKey) keys.push('shift');
        keys.push(e.key.toLowerCase() === 'enter' ? 'enter' : e.key.toLowerCase());
        return keys.join('+');
    }

    executeAction(action) {
        console.log('Executando ação:', action); // Debug
        
        // Adicionar efeito visual quando atalho é ativado
        this.addShortcutActivationEffect();

        switch(action) {
            case 'finalizarVenda':
                this.finalizarVenda();
                break;
            case 'adicionarMultiplos':
                this.adicionarMultiplos();
                break;
            case 'focarPesquisa':
                this.focarPesquisa();
                break;
            case 'aplicarDesconto':
                this.aplicarDesconto();
                break;
            case 'limparCarrinho':
                this.limparCarrinho();
                break;
            case 'sair':
                this.sair();
                break;
        }
    }

    addShortcutActivationEffect() {
        const container = document.querySelector('.sales-container');
        if (container) {
            container.classList.add('shortcut-activated');
            setTimeout(() => {
                container.classList.remove('shortcut-activated');
            }, 300);
        }
    }

    // Métodos de ação integrados com o sistema de vendas - CORRIGIDOS
    finalizarVenda() {
        console.log('Tentando finalizar venda...');
        
        if (window.salesSystem) {
            const paymentModal = document.getElementById('paymentModal');
            const confirmBtn = document.getElementById('confirmPaymentBtn');
            
            if (paymentModal && paymentModal.style.display === 'block') {
                // Se modal de pagamento está aberto e botão está visível
                if (confirmBtn && confirmBtn.style.display !== 'none') {
                    window.salesSystem.confirmSale();
                } else {
                    // Modal aberto mas não pode confirmar ainda
                    console.log('Pagamento não completo ainda');
                }
            } else {
                // Modal não está aberto, abrir modal de pagamento
                window.salesSystem.showPaymentModal();
            }
        }
    }

    adicionarMultiplos() {
        if (window.salesSystem) {
            window.salesSystem.showMultipleAddModal();
        }
    }

    focarPesquisa() {
        const searchInput = document.getElementById('salesSearchInput');
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        }
    }

    aplicarDesconto() {
        if (window.salesSystem) {
            window.salesSystem.showDiscountModal();
        }
    }

    limparCarrinho() {
        if (window.salesSystem) {
            window.salesSystem.clearCart();
        }
    }

    // MÉTODO SAIR CORRIGIDO - Sistema de duplo ESC melhorado
    sair() {
        // Limpar timeout de reset anterior se existir
        if (this.escResetTimeout) {
            clearTimeout(this.escResetTimeout);
            this.escResetTimeout = null;
        }

        // Verificar se há modal aberto primeiro
        const openModal = document.querySelector('.sales-modal[style*="block"]');
        if (openModal) {
            // Fechar modal aberto e resetar contador
            openModal.style.display = 'none';
            this.escPressCount = 0;
            return;
        }

        // Incrementar contador de ESC
        this.escPressCount++;

        if (this.escPressCount === 1) {
            // Primeira pressão - mostrar aviso
            this.showExitConfirmation();
            
            // Resetar contador após 3 segundos
            this.escResetTimeout = setTimeout(() => {
                this.escPressCount = 0;
                this.hideExitConfirmation();
            }, 3000);
        } else if (this.escPressCount >= 2) {
            // Segunda pressão - sair
            this.escPressCount = 0;
            this.hideExitConfirmation();
            if (window.salesSystem) {
                window.salesSystem.exitSalesInterface();
            }
        }
    }

    showExitConfirmation() {
        // Remover confirmação anterior se existir
        this.hideExitConfirmation();

        const confirmDiv = document.createElement('div');
        confirmDiv.id = 'exitConfirmation';
        confirmDiv.className = 'exit-confirmation';
        confirmDiv.innerHTML = `
            <div class="exit-confirmation-content">
                <p>🚪 Pressione <kbd>ESC</kbd> novamente para sair</p>
                <div class="exit-timer"></div>
            </div>
        `;

        document.body.appendChild(confirmDiv);

        // Animação da barra de progresso
        const timer = confirmDiv.querySelector('.exit-timer');
        timer.style.width = '100%';
        setTimeout(() => {
            timer.style.width = '0%';
        }, 100);
    }

    hideExitConfirmation() {
        const existing = document.getElementById('exitConfirmation');
        if (existing) {
            existing.remove();
        }
    }

    activate() {
        this.isActive = true;
        this.escPressCount = 0; // Reset contador ao ativar
        console.log('Atalhos ativados');
    }

    deactivate() {
        this.isActive = false;
        this.escPressCount = 0; // Reset contador ao desativar
        console.log('Atalhos desativados');
        
        // Limpar timeouts
        if (this.escResetTimeout) {
            clearTimeout(this.escResetTimeout);
            this.escResetTimeout = null;
        }
        
        this.hideExitConfirmation();
    }

    addShortcutStyles() {
        if (document.getElementById('shortcutStyles')) return;

        const style = document.createElement('style');
        style.id = 'shortcutStyles';
        style.textContent = `
            .exit-confirmation {
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 15px 20px;
                border-radius: 10px;
                z-index: 9999;
                animation: slideIn 0.3s ease;
                min-width: 250px;
            }

            .exit-confirmation-content p {
                margin: 0 0 10px 0;
                text-align: center;
            }

            .exit-timer {
                height: 3px;
                background: #007bff;
                border-radius: 2px;
                transition: width 3s linear;
            }

            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            .btn-shortcut {
                background: rgba(255, 255, 255, 0.2);
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 10px;
                font-weight: bold;
                margin-right: 8px;
            }

            .shortcut-activated {
                animation: shortcutPulse 0.3s ease;
            }

            @keyframes shortcutPulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.02); }
                100% { transform: scale(1); }
            }

            kbd {
                background: #f8f9fa;
                border: 1px solid #ddd;
                border-radius: 4px;
                padding: 4px 8px;
                font-family: monospace;
                font-size: 12px;
                margin-right: 5px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
        `;

        document.head.appendChild(style);
    }
}

// Sistema de Vendas - Versão Completa Integrada com Header Melhorado
class SalesSystem {
    constructor() {
        this.cart = [];
        this.total = 0;
        this.discount = 0;
        this.paymentMethods = [];
        this.totalPaid = 0;
        this.isActive = false;
        this.multipleAddQuantity = 1;
        this.selectedMultipleProduct = null;
        
        // Integração com sistema de atalhos
        this.shortcutSystem = new ImprovedShortcutSystem();
    }

    init() {
        this.addSalesStyles();
        this.shortcutSystem.init();
        console.log('Sistema de Vendas inicializado com atalhos melhorados!');
    }

    showSalesInterface() {
        // Verificar se há produtos usando a variável global correta
        const currentProducts = window.vendedorProducts || [];
        console.log('Verificando produtos para vendas:', currentProducts);
        
        if (!currentProducts || currentProducts.length === 0) {
            alert('Você precisa cadastrar produtos primeiro antes de fazer vendas!');
            this.goBackToHome();
            return;
        }

        // LIMPAR CARRINHO AUTOMATICAMENTE AO ENTRAR NO SISTEMA DE VENDAS
        this.cart = [];
        this.discount = 0;
        this.paymentMethods = [];
        this.totalPaid = 0;

        this.isActive = true;
        
        // Ativar sistema de atalhos
        this.shortcutSystem.activate();
        
        const vendedorContent = document.getElementById('vendedorContent');
        
        // Esconder outros elementos
        const logo = vendedorContent.querySelector('.dashboard-logo');
        const productsList = document.getElementById('vendedorProductsList');
        const searchContainer = document.getElementById('vendedorSearchContainer');
        const productForm = document.getElementById('vendedorProductForm');
        
        if (logo) logo.style.display = 'none';
        productsList.classList.remove('show');
        searchContainer.classList.remove('show');
        if (productForm) productForm.style.display = 'none';
        
        // Criar interface de vendas
        let salesInterface = document.getElementById('salesInterface');
        if (!salesInterface) {
            salesInterface = document.createElement('div');
            salesInterface.id = 'salesInterface';
            vendedorContent.appendChild(salesInterface);
        }
        
        salesInterface.innerHTML = this.getSalesInterfaceHTML();
        salesInterface.style.display = 'block';
        
        // Configurar event listeners específicos do sistema de vendas
        this.setupSalesEventListeners();
        
        // Focar na barra de pesquisa
        setTimeout(() => {
            const searchInput = document.getElementById('salesSearchInput');
            if (searchInput) searchInput.focus();
        }, 100);
    }

    getSalesInterfaceHTML() {
        return `
            <div class="sales-container">
                <div class="sales-header">
                    <h2>💰 Sistema de Vendas</h2>
                    <div class="sales-shortcuts">
                        <div class="shortcut-group">
                            <span><kbd>F2</kbd> ou <kbd>Ctrl+Enter</kbd> - Finalizar</span>
                            <span><kbd>F5</kbd> ou <kbd>Ctrl+M</kbd> - Múltiplos</span>
                            <span><kbd>F9</kbd> ou <kbd>Ctrl+F</kbd> - Buscar</span>
                        </div>
                        <div class="shortcut-group">
                            <span><kbd>F10</kbd> ou <kbd>Ctrl+D</kbd> - Desconto</span>
                            <span><kbd>F12</kbd> ou <kbd>Ctrl+L</kbd> - Limpar</span>
                            <span><kbd>ESC</kbd> - Sair/Fechar</span>
                        </div>
                    </div>
                </div>
                
                <div class="sales-search-container">
                    <div class="search-with-quantity">
                        <div class="quantity-selector">
                            <label>Qtd:</label>
                            <input type="number" id="quickQuantity" value="1" min="1" max="999" class="quick-quantity-input">
                        </div>
                        <input type="text" id="salesSearchInput" placeholder="Digite o nome do produto ou código EAN..." class="sales-search-input">
                    </div>
                    <div class="sales-search-results" id="salesSearchResults"></div>
                </div>
                
                <div class="sales-content">
                    <div class="sales-cart">
                        <h3>🛒 Carrinho de Compras</h3>
                        <div class="cart-items" id="cartItems">
                            <div class="empty-cart">Carrinho vazio - Adicione produtos para começar</div>
                        </div>
                        
                        <div class="cart-summary">
                            <div class="summary-line">
                                <span>Subtotal:</span>
                                <span id="subtotal">R$ 0,00</span>
                            </div>
                            <div class="summary-line discount-line" id="discountLine" style="display: none;">
                                <span>Desconto (<span id="discountPercent">0</span>%):</span>
                                <span id="discountAmount">- R$ 0,00</span>
                            </div>
                            <div class="summary-line total-line">
                                <span><strong>TOTAL:</strong></span>
                                <span id="totalAmount"><strong>R$ 0,00</strong></span>
                            </div>
                        </div>
                        
                        <div class="sales-buttons">
                            <button class="sales-btn multiple-btn" onclick="window.salesSystem.showMultipleAddModal()">
                                <span class="btn-shortcut">F5</span>
                                Múltiplos
                            </button>
                            <button class="sales-btn discount-btn" onclick="window.salesSystem.showDiscountModal()">
                                <span class="btn-shortcut">F10</span>
                                Desconto
                            </button>
                            <button class="sales-btn clear-btn" onclick="window.salesSystem.clearCart()">
                                <span class="btn-shortcut">F12</span>
                                Limpar
                            </button>
                            <button class="sales-btn finish-btn" onclick="window.salesSystem.showPaymentModal()">
                                <span class="btn-shortcut">F2</span>
                                Finalizar
                            </button>
                        </div>
                    </div>
                </div>
                
                <button class="back-to-home-btn" onclick="window.salesSystem.exitSalesInterface()">
                    ← Voltar ao Home
                </button>
            </div>
            ${this.getModalsHTML()}
        `;
    }

    getModalsHTML() {
        return `
            <!-- Modal de Adição Múltipla -->
            <div id="multipleAddModal" class="sales-modal">
                <div class="sales-modal-content">
                    <h3>📦 Adicionar Múltiplos Produtos</h3>
                    <div class="multiple-add-container">
                        <div class="quantity-input-section">
                            <label for="multipleQuantity">Quantidade:</label>
                            <input type="number" id="multipleQuantity" value="1" min="1" max="999" class="multiple-quantity-input">
                        </div>
                        <div class="product-search-section">
                            <label for="multipleSearchInput">Buscar Produto:</label>
                            <input type="text" id="multipleSearchInput" placeholder="Digite o nome do produto..." class="multiple-search-input">
                            <div class="multiple-search-results" id="multipleSearchResults"></div>
                        </div>
                        <div class="multiple-preview" id="multiplePreview" style="display: none;">
                            <h4>Preview:</h4>
                            <div class="preview-item" id="previewItem"></div>
                        </div>
                    </div>
                    <div class="modal-buttons">
                        <button class="modal-btn cancel-btn" onclick="window.salesSystem.closeMultipleAddModal()">Cancelar</button>
                        <button class="modal-btn confirm-btn" id="confirmMultipleAdd" onclick="window.salesSystem.confirmMultipleAdd()" style="display: none;">Adicionar ao Carrinho</button>
                    </div>
                </div>
            </div>

            <!-- Modal de Desconto -->
            <div id="discountModal" class="sales-modal">
                <div class="sales-modal-content">
                    <h3>🏷️ Aplicar Desconto</h3>
                    <div class="discount-options">
                        <button class="discount-option" onclick="window.salesSystem.applyDiscount(5)">
                            <span class="discount-value">5%</span>
                            <span class="discount-amount">- R$ ${(this.total * 0.05).toFixed(2)}</span>
                        </button>
                        <button class="discount-option" onclick="window.salesSystem.applyDiscount(10)">
                            <span class="discount-value">10%</span>
                            <span class="discount-amount">- R$ ${(this.total * 0.10).toFixed(2)}</span>
                        </button>
                        <button class="discount-option custom-discount" onclick="window.salesSystem.showCustomDiscountInput()">
                            <span class="discount-value">Personalizado</span>
                            <span class="discount-amount">Digite o valor</span>
                        </button>
                    </div>
                    <div class="modal-buttons">
                        <button class="modal-btn cancel-btn" onclick="window.salesSystem.closeDiscountModal()">Cancelar</button>
                        <button class="modal-btn remove-btn" onclick="window.salesSystem.removeDiscount()" style="display: ${this.discount > 0 ? 'block' : 'none'}">Remover Desconto</button>
                    </div>
                </div>
            </div>
            
            <!-- Modal de Pagamento -->
            <div id="paymentModal" class="sales-modal">
                <div class="sales-modal-content payment-modal">
                    <h3>💳 Finalizar Venda</h3>
                    <div class="payment-summary">
                        <div class="payment-total">
                            <span>Total a pagar: <strong>R$ ${(this.total - this.discount).toFixed(2)}</strong></span>
                        </div>
                        <div class="payment-remaining" id="paymentRemaining">
                            <span>Restante: <strong>R$ ${(this.total - this.discount - this.totalPaid).toFixed(2)}</strong></span>
                        </div>
                    </div>
                    
                    <div class="payment-methods">
                        <button class="payment-method" onclick="window.salesSystem.addPaymentMethod('debito')">💳 Débito</button>
                        <button class="payment-method" onclick="window.salesSystem.addPaymentMethod('credito')">💳 Crédito</button>
                        <button class="payment-method" onclick="window.salesSystem.addPaymentMethod('pix')">📱 PIX</button>
                        <button class="payment-method" onclick="window.salesSystem.addPaymentMethod('dinheiro')">💵 Dinheiro</button>
                        <button class="payment-method" onclick="window.salesSystem.addPaymentMethod('voucher')">🎫 Voucher</button>
                    </div>
                    
                    <div class="payment-list" id="paymentList"></div>
                    
                    <div class="modal-buttons">
                        <button class="modal-btn cancel-btn" onclick="window.salesSystem.closePaymentModal()">Cancelar</button>
                        <button class="modal-btn confirm-btn" id="confirmPaymentBtn" onclick="window.salesSystem.confirmSale()" style="display: none;">
                            <span class="btn-shortcut">F2</span>
                            Confirmar Venda
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Modal de Input de Valor -->
            <div id="valueInputModal" class="sales-modal">
                <div class="sales-modal-content value-input-modal">
                    <h3 id="valueInputTitle">Valor</h3>
                    <div class="value-input-container">
                        <label>Digite o valor:</label>
                        <input type="number" id="valueInput" step="0.01" min="0" placeholder="0,00">
                    </div>
                    <div class="modal-buttons">
                        <button class="modal-btn cancel-btn" onclick="window.salesSystem.closeValueInputModal()">Cancelar</button>
                        <button class="modal-btn confirm-btn" onclick="window.salesSystem.confirmValue()">Confirmar</button>
                    </div>
                </div>
            </div>
        `;
    }
    

    setupSalesEventListeners() {
        const searchInput = document.getElementById('salesSearchInput');
        const quickQuantity = document.getElementById('quickQuantity');
        
        if (searchInput) {
            searchInput.removeEventListener('input', this.handleSalesSearch);
            searchInput.addEventListener('input', (e) => this.handleSalesSearch(e));
        }

        if (quickQuantity) {
            quickQuantity.addEventListener('change', () => {
                const value = parseInt(quickQuantity.value);
                if (value < 1) quickQuantity.value = 1;
                if (value > 999) quickQuantity.value = 999;
            });
        }
    }

    handleSalesSearch = (e) => {
        if (!this.isActive) return;
        this.searchProducts(e.target.value);
    }

    searchProducts(searchTerm) {
    const resultsContainer = document.getElementById('salesSearchResults');
    
    if (!searchTerm.trim()) {
        resultsContainer.innerHTML = '';
        resultsContainer.style.display = 'none';
        return;
    }
    
    const currentProducts = window.vendedorProducts || [];
    const term = searchTerm.toLowerCase();
    const matchedProducts = currentProducts.filter(product => {
        const nameMatch = product.nomeProduto.toLowerCase().includes(term);
        const eanMatch = product.eanCodes.some(ean => ean.toLowerCase().includes(term));
        return nameMatch || eanMatch;
    });
    
    if (matchedProducts.length === 0) {
        resultsContainer.innerHTML = '<div class="no-results">Nenhum produto encontrado</div>';
        resultsContainer.style.display = 'block';
        return;
    }
    
    // Verificar quais produtos já estão no carrinho
    resultsContainer.innerHTML = matchedProducts.map(product => {
        const inCart = this.cart.find(item => item.id === product.id);
        const inCartClass = inCart ? ' in-cart' : '';
        const inCartBadge = inCart ? 
            `<div class="cart-badge">No carrinho: ${inCart.quantity}</div>` : '';
        
        return `
            <div class="search-result-item${inCartClass}" onclick="window.salesSystem.addToCartWithQuantity(${product.id})">
                <div class="result-image">
                    ${product.image ? `<img src="${product.image}" alt="${product.nomeProduto}">` : '📦'}
                </div>
                <div class="result-info">
                    <div class="result-name">${product.nomeProduto}</div>
                    <div class="result-price">R$ ${parseFloat(product.preco).toFixed(2)}</div>
                    <div class="result-ean">EAN: ${product.eanCodes.join(', ')}</div>
                    ${inCartBadge}
                </div>
            </div>
        `;
    }).join('');
    
    resultsContainer.style.display = 'block';
}
    addToCartWithQuantity(productId) {
        const quantity = parseInt(document.getElementById('quickQuantity').value) || 1;
        this.addToCart(productId, quantity);
    }

    addToCart(productId, quantity = 1) {
    const currentProducts = window.vendedorProducts || [];
    const product = currentProducts.find(p => p.id === productId);
    
    if (!product) {
        console.log('Produto não encontrado:', productId);
        return;
    }
    
    // CORREÇÃO: SEMPRE SOMAR as quantidades - COMPORTAMENTO NORMAL DE PDV
    const existingItemIndex = this.cart.findIndex(item => item.id === productId);
    
    if (existingItemIndex !== -1) {
        // Produto já existe no carrinho - SOMAR quantidade
        this.cart[existingItemIndex].quantity += quantity;
        console.log(`Produto ${product.nomeProduto} somado no carrinho. Total: ${this.cart[existingItemIndex].quantity}`);
    } else {
        // Produto não existe no carrinho - adicionar novo item
        this.cart.push({
            id: product.id,
            name: product.nomeProduto,
            price: parseFloat(product.preco),
            image: product.image,
            quantity: quantity
        });
        console.log(`Produto ${product.nomeProduto} adicionado ao carrinho com quantidade: ${quantity}`);
    }
    
    this.updateCart();
    
    // Limpar barra de pesquisa e resetar quantidade
    document.getElementById('salesSearchInput').value = '';
    document.getElementById('salesSearchResults').innerHTML = '';
    document.getElementById('salesSearchResults').style.display = 'none';
    document.getElementById('quickQuantity').value = 1;
    
    // Focar na pesquisa novamente
    setTimeout(() => {
        document.getElementById('salesSearchInput').focus();
    }, 100);

    // Mostrar feedback visual
    this.showAddToCartFeedback(product.nomeProduto, quantity, existingItemIndex !== -1);
}
showAddToCartFeedback(productName, quantity, wasUpdated = false) {
    // Remover feedback anterior se existir
    const existingFeedback = document.querySelector('.add-to-cart-feedback');
    if (existingFeedback) {
        existingFeedback.remove();
    }

    // Criar elemento de feedback
    const feedback = document.createElement('div');
    feedback.className = 'add-to-cart-feedback';
    
    const action = wasUpdated ? 'Somado' : 'Adicionado';
    const icon = wasUpdated ? '+' : '✓';
    
    feedback.innerHTML = `
        <div class="feedback-content">
            ${icon} ${productName} 
            <span class="quantity-badge">${quantity}</span> 
            ${action.toLowerCase()} no carrinho
        </div>
    `;
    
    // Adicionar ao DOM
    const salesContainer = document.querySelector('.sales-container');
    if (salesContainer) {
        salesContainer.appendChild(feedback);
        
        // Animar entrada
        setTimeout(() => {
            feedback.classList.add('show');
        }, 100);
        
        // Remover após 2 segundos
        setTimeout(() => {
            feedback.classList.remove('show');
            setTimeout(() => {
                if (feedback.parentNode) {
                    feedback.parentNode.removeChild(feedback);
                }
            }, 300);
        }, 2000);
    }
}

selectMultipleProduct(productId) {
    const currentProducts = window.vendedorProducts || [];
    const product = currentProducts.find(p => p.id === productId);
    
    if (!product) return;
    
    // Guardar produto selecionado
    this.selectedMultipleProduct = product;
    
    // Atualizar input de busca
    document.getElementById('multipleSearchInput').value = product.nomeProduto;
    
    // Esconder resultados
    document.getElementById('multipleSearchResults').style.display = 'none';
    
    // Mostrar preview
    this.showMultiplePreview(product);
    
    // NOVO: Verificar se produto já está no carrinho
    const existingItem = this.cart.find(item => item.id === productId);
    if (existingItem) {
        // Mostrar aviso de que o produto já está no carrinho
        const previewContainer = document.getElementById('multiplePreview');
        const warningDiv = document.createElement('div');
        warningDiv.className = 'cart-warning';
        warningDiv.innerHTML = `
            <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 10px; margin-top: 10px; color: #856404;">
                ⚠️ Este produto já está no carrinho (${existingItem.quantity} unidades).
                <br>Ao adicionar, as quantidades serão somadas.
            </div>
        `;
        
        // Remover aviso anterior se existir
        const existingWarning = previewContainer.querySelector('.cart-warning');
        if (existingWarning) {
            existingWarning.remove();
        }
        
        previewContainer.appendChild(warningDiv);
    }
}

    // Modal de adição múltipla
    showMultipleAddModal() {
        document.getElementById('multipleAddModal').style.display = 'block';
        
        // Configurar listeners do modal
        this.setupMultipleAddListeners();
        
        // Focar na quantidade
        setTimeout(() => {
            document.getElementById('multipleQuantity').focus();
            document.getElementById('multipleQuantity').select();
        }, 100);
    }

    setupMultipleAddListeners() {
        const searchInput = document.getElementById('multipleSearchInput');
        const quantityInput = document.getElementById('multipleQuantity');
        
        // Remover listeners anteriores
        searchInput.removeEventListener('input', this.handleMultipleSearch);
        quantityInput.removeEventListener('change', this.handleMultipleQuantityChange);
        
        // Adicionar novos listeners
        searchInput.addEventListener('input', (e) => this.handleMultipleSearch(e));
        quantityInput.addEventListener('change', () => this.handleMultipleQuantityChange());
    }

    handleMultipleSearch = (e) => {
        this.searchMultipleProducts(e.target.value);
    }

    handleMultipleQuantityChange() {
        const quantityInput = document.getElementById('multipleQuantity');
        const value = parseInt(quantityInput.value);
        
        if (value < 1) quantityInput.value = 1;
        if (value > 999) quantityInput.value = 999;
        
        this.updateMultiplePreview();
    }

    searchMultipleProducts(searchTerm) {
        const resultsContainer = document.getElementById('multipleSearchResults');
        
        if (!searchTerm.trim()) {
            resultsContainer.innerHTML = '';
            resultsContainer.style.display = 'none';
            this.hideMultiplePreview();
            return;
        }
        
        const currentProducts = window.vendedorProducts || [];
        const term = searchTerm.toLowerCase();
        const matchedProducts = currentProducts.filter(product => {
            const nameMatch = product.nomeProduto.toLowerCase().includes(term);
            const eanMatch = product.eanCodes.some(ean => ean.toLowerCase().includes(term));
            return nameMatch || eanMatch;
        });
        
        if (matchedProducts.length === 0) {
            resultsContainer.innerHTML = '<div class="no-results">Nenhum produto encontrado</div>';
            resultsContainer.style.display = 'block';
            this.hideMultiplePreview();
            return;
        }
        
        resultsContainer.innerHTML = matchedProducts.map(product => `
            <div class="search-result-item" onclick="window.salesSystem.selectMultipleProduct(${product.id})">
                <div class="result-image">
                    ${product.image ? `<img src="${product.image}" alt="${product.nomeProduto}">` : '📦'}
                </div>
                <div class="result-info">
                    <div class="result-name">${product.nomeProduto}</div>
                    <div class="result-price">R$ ${parseFloat(product.preco).toFixed(2)}</div>
                    <div class="result-ean">EAN: ${product.eanCodes.join(', ')}</div>
                </div>
            </div>
        `).join('');
        
        resultsContainer.style.display = 'block';
    }

    selectMultipleProduct(productId) {
    const currentProducts = window.vendedorProducts || [];
    const product = currentProducts.find(p => p.id === productId);
    
    if (!product) return;
    
    // Guardar produto selecionado
    this.selectedMultipleProduct = product;
    
    // Atualizar input de busca
    document.getElementById('multipleSearchInput').value = product.nomeProduto;
    
    // Esconder resultados
    document.getElementById('multipleSearchResults').style.display = 'none';
    
    // Mostrar preview
    this.showMultiplePreview(product);
    
    // Verificar se produto já está no carrinho
    const existingItem = this.cart.find(item => item.id === productId);
    if (existingItem) {
        // Mostrar aviso de soma
        const previewContainer = document.getElementById('multiplePreview');
        const warningDiv = document.createElement('div');
        warningDiv.className = 'cart-warning';
        warningDiv.innerHTML = `
            <div style="background: #e8f5e8; border: 1px solid #28a745; border-radius: 8px; padding: 10px; margin-top: 10px; color: #155724;">
                + Este produto já está no carrinho (${existingItem.quantity} unidades).
                <br><strong>A quantidade será SOMADA.</strong>
            </div>
        `;
        
        // Remover aviso anterior se existir
        const existingWarning = previewContainer.querySelector('.cart-warning');
        if (existingWarning) {
            existingWarning.remove();
        }
        
        previewContainer.appendChild(warningDiv);
    }
}

    showMultiplePreview(product) {
        const previewContainer = document.getElementById('multiplePreview');
        const previewItem = document.getElementById('previewItem');
        const quantity = parseInt(document.getElementById('multipleQuantity').value) || 1;
        const total = (parseFloat(product.preco) * quantity);
        
        previewItem.innerHTML = `
            <div class="preview-product">
                <div class="preview-image">
                    ${product.image ? `<img src="${product.image}" alt="${product.nomeProduto}">` : '📦'}
                </div>
                <div class="preview-details">
                    <div class="preview-name">${product.nomeProduto}</div>
                    <div class="preview-calculation">
                        ${quantity} x R$ ${parseFloat(product.preco).toFixed(2)} = <strong>R$ ${total.toFixed(2)}</strong>
                    </div>
                </div>
            </div>
        `;
        
        previewContainer.style.display = 'block';
        document.getElementById('confirmMultipleAdd').style.display = 'block';
    }

    hideMultiplePreview() {
        document.getElementById('multiplePreview').style.display = 'none';
        document.getElementById('confirmMultipleAdd').style.display = 'none';
        this.selectedMultipleProduct = null;
    }

    updateMultiplePreview() {
        if (this.selectedMultipleProduct) {
            this.showMultiplePreview(this.selectedMultipleProduct);
        }
    }

    confirmMultipleAdd() {
    if (!this.selectedMultipleProduct) return;
    
    const quantity = parseInt(document.getElementById('multipleQuantity').value) || 1;
    
    // Usar addToCart que agora soma as quantidades
    this.addToCart(this.selectedMultipleProduct.id, quantity);
    
    // Fechar modal e limpar
    this.closeMultipleAddModal();
}


    closeMultipleAddModal() {
        document.getElementById('multipleAddModal').style.display = 'none';
        
        // Limpar campos
        document.getElementById('multipleQuantity').value = 1;
        document.getElementById('multipleSearchInput').value = '';
        document.getElementById('multipleSearchResults').innerHTML = '';
        document.getElementById('multipleSearchResults').style.display = 'none';
        this.hideMultiplePreview();
    }

    updateCart() {
        const cartContainer = document.getElementById('cartItems');
        
        if (this.cart.length === 0) {
            cartContainer.innerHTML = '<div class="empty-cart">Carrinho vazio - Adicione produtos para começar</div>';
        } else {
            cartContainer.innerHTML = this.cart.map(item => `
                <div class="cart-item">
                    <div class="cart-item-image">
                        ${item.image ? `<img src="${item.image}" alt="${item.name}">` : '📦'}
                    </div>
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">R$ ${item.price.toFixed(2)}</div>
                    </div>
                    <div class="cart-item-controls">
                        <button class="qty-btn" onclick="window.salesSystem.changeQuantity(${item.id}, -1)">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="qty-btn" onclick="window.salesSystem.changeQuantity(${item.id}, 1)">+</button>
                    </div>
                    <div class="cart-item-total">
                        <strong>R$ ${(item.price * item.quantity).toFixed(2)}</strong>
                    </div>
                    <button class="remove-item-btn" onclick="window.salesSystem.removeFromCart(${item.id})">×</button>
                </div>
            `).join('');
        }
        
        this.updateTotals();
    }

    changeQuantity(productId, change) {
        const item = this.cart.find(item => item.id === productId);
        if (!item) return;
        
        item.quantity += change;
        
        if (item.quantity <= 0) {
            this.removeFromCart(productId);
        } else {
            this.updateCart();
        }
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.updateCart();
    }

    updateTotals() {
        this.total = this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        
        document.getElementById('subtotal').textContent = `R$ ${this.total.toFixed(2)}`;
        
        const discountLine = document.getElementById('discountLine');
        if (this.discount > 0) {
            discountLine.style.display = 'flex';
            const discountPercentage = (this.discount / this.total * 100).toFixed(0);
            document.getElementById('discountPercent').textContent = discountPercentage;
            document.getElementById('discountAmount').textContent = `- R$ ${this.discount.toFixed(2)}`;
        } else {
            discountLine.style.display = 'none';
        }
        
        const finalTotal = this.total - this.discount;
        document.getElementById('totalAmount').innerHTML = `<strong>R$ ${finalTotal.toFixed(2)}</strong>`;
    }

    showDiscountModal() {
        if (this.cart.length === 0) {
            alert('Adicione produtos ao carrinho primeiro!');
            return;
        }
        document.getElementById('discountModal').style.display = 'block';
    }

    closeDiscountModal() {
        document.getElementById('discountModal').style.display = 'none';
    }

    applyDiscount(percentage) {
        this.discount = this.total * (percentage / 100);
        this.updateTotals();
        this.closeDiscountModal();
        this.paymentMethods = [];
        this.totalPaid = 0;
    }

    removeDiscount() {
        this.discount = 0;
        this.updateTotals();
        this.closeDiscountModal();
        this.paymentMethods = [];
        this.totalPaid = 0;
    }

    clearCart() {
        if (this.cart.length === 0) return;
        
        if (confirm('Tem certeza que deseja limpar o carrinho?')) {
            this.cart = [];
            this.discount = 0;
            this.paymentMethods = [];
            this.totalPaid = 0;
            this.updateCart();
            
            setTimeout(() => {
                document.getElementById('salesSearchInput').focus();
            }, 100);
        }
    }

    showPaymentModal() {
        if (this.cart.length === 0) {
            alert('Adicione produtos ao carrinho primeiro!');
            return;
        }
        document.getElementById('paymentModal').style.display = 'block';
        this.updatePaymentRemaining();
    }

    closePaymentModal() {
        document.getElementById('paymentModal').style.display = 'none';
    }

    addPaymentMethod(method) {
        const finalTotal = this.total - this.discount;
        const remaining = finalTotal - this.totalPaid;
        
        if (remaining <= 0.01) {
            alert('O pagamento já foi completado!');
            return;
        }
        
        const methodNames = {
            'debito': 'Débito',
            'credito': 'Crédito', 
            'pix': 'PIX',
            'dinheiro': 'Dinheiro',
            'voucher': 'Voucher'
        };
        
        document.getElementById('valueInputTitle').textContent = `Pagamento - ${methodNames[method]}`;
        document.getElementById('valueInput').value = remaining.toFixed(2);
        document.getElementById('valueInputModal').style.display = 'block';
        document.getElementById('valueInputModal').dataset.action = 'payment';
        document.getElementById('valueInputModal').dataset.method = method;
    }

    closeValueInputModal() {
        document.getElementById('valueInputModal').style.display = 'none';
    }

    confirmValue() {
        const value = parseFloat(document.getElementById('valueInput').value);
        const action = document.getElementById('valueInputModal').dataset.action;
        
        if (isNaN(value) || value <= 0) {
            alert('Digite um valor válido!');
            return;
        }
        
        if (action === 'payment') {
            const method = document.getElementById('valueInputModal').dataset.method;
            const finalTotal = this.total - this.discount;
            const remaining = finalTotal - this.totalPaid;
            
            const methodNames = {
                'debito': 'Débito',
                'credito': 'Crédito',
                'pix': 'PIX',
                'dinheiro': 'Dinheiro',
                'voucher': 'Voucher'
            };
            
            const paymentAmount = Math.min(value, remaining);
            const change = method === 'dinheiro' ? Math.max(0, value - remaining) : 0;
            
            this.paymentMethods.push({
                method: method,
                name: methodNames[method],
                amount: paymentAmount,
                change: change
            });
            
            this.totalPaid += paymentAmount;
            this.updatePaymentList();
            this.updatePaymentRemaining();
        } else if (action === 'custom-discount') {
            this.discount = this.total * (value / 100);
            this.updateTotals();
            this.closeDiscountModal();
            this.paymentMethods = [];
            this.totalPaid = 0;
        }
        
        this.closeValueInputModal();
    }

    updatePaymentList() {
        const paymentList = document.getElementById('paymentList');
        
        if (this.paymentMethods.length === 0) {
            paymentList.innerHTML = '';
            return;
        }
        
        paymentList.innerHTML = `
            <div class="payment-list-header">
                <h4>Formas de Pagamento:</h4>
            </div>
            ${this.paymentMethods.map((payment, index) => `
                <div class="payment-item">
                    <span class="payment-method-name">${payment.name}:</span>
                    <span class="payment-amount">R$ ${payment.amount.toFixed(2)}</span>
                    ${payment.change > 0 ? `<span class="payment-change">(Troco: R$ ${payment.change.toFixed(2)})</span>` : ''}
                    <button class="remove-payment-btn" onclick="window.salesSystem.removePaymentMethod(${index})">×</button>
                </div>
            `).join('')}
        `;
    }

    updatePaymentRemaining() {
        const finalTotal = this.total - this.discount;
        const remaining = finalTotal - this.totalPaid;
        
        const remainingElement = document.getElementById('paymentRemaining');
        const confirmBtn = document.getElementById('confirmPaymentBtn');
        
        if (remaining <= 0.01) {
            remainingElement.innerHTML = '<span class="payment-complete">✅ Pagamento Completo!</span>';
            confirmBtn.style.display = 'block';
        } else {
            remainingElement.innerHTML = `<span>Restante: <strong>R$ ${remaining.toFixed(2)}</strong></span>`;
            confirmBtn.style.display = 'none';
        }
    }

    removePaymentMethod(index) {
        const removedPayment = this.paymentMethods[index];
        this.totalPaid -= removedPayment.amount;
        this.paymentMethods.splice(index, 1);
        this.updatePaymentList();
        this.updatePaymentRemaining();
    }

    confirmSale() {
        const finalTotal = this.total - this.discount;
        
        if (Math.abs(finalTotal - this.totalPaid) > 0.01) {
            alert('O pagamento ainda não foi completado!');
            return;
        }
        try {
        if (window.inventorySystem) {
            window.inventorySystem.processSale(this.cart);
        }
    } catch (error) {
        console.error('Erro ao processar estoque:', error);
        alert('Erro ao atualizar estoque: ' + error.message);
        return; // Não concluir venda se houver erro no estoque
    }
        
        this.showSaleReceipt();
        
        this.cart = [];
        this.discount = 0;
        this.paymentMethods = [];
        this.totalPaid = 0;
        
        this.closePaymentModal();
        this.updateCart();
        
        setTimeout(() => {
            document.getElementById('salesSearchInput').focus();
        }, 100);
    }

    showSaleReceipt() {
        const finalTotal = this.total - this.discount;
        const totalChange = this.paymentMethods.reduce((sum, payment) => sum + payment.change, 0);
        
        let receipt = `╔═══════════════════════════════════════════════╗\n          SYSTEM CODE\n         RECIBO DE VENDA\n╚═══════════════════════════════════════════════╝\n\nPRODUTOS:\n`;
        
        this.cart.forEach(item => {
            receipt += `${item.name}\n  ${item.quantity}x R$ ${item.price.toFixed(2)} = R$ ${(item.quantity * item.price).toFixed(2)}\n\n`;
        });
        
        receipt += `───────────────────────────────────────────────\nSUBTOTAL: R$ ${this.total.toFixed(2)}\n`;
        
        if (this.discount > 0) {
            const discountPercent = (this.discount / this.total * 100).toFixed(1);
            receipt += `DESCONTO (${discountPercent}%): -R$ ${this.discount.toFixed(2)}\n`;
        }
        
        receipt += `TOTAL: R$ ${finalTotal.toFixed(2)}\n───────────────────────────────────────────────\n\nPAGAMENTO:\n`;
        this.paymentMethods.forEach(payment => {
            receipt += `  ${payment.name}: R$ ${payment.amount.toFixed(2)}\n`;
        });
        
        if (totalChange > 0) {
            receipt += `\nTROCO: R$ ${totalChange.toFixed(2)}\n`;
        }
        
        receipt += `\n╔═══════════════════════════════════════════════╗\n     Obrigado pela preferência!\n╚═══════════════════════════════════════════════╝`;
        
        alert(receipt);
    }

    showCustomDiscountInput() {
        document.getElementById('valueInputTitle').textContent = 'Desconto Personalizado (%)';
        document.getElementById('valueInput').placeholder = '0';
        document.getElementById('valueInput').value = '';
        document.getElementById('valueInputModal').style.display = 'block';
        document.getElementById('valueInputModal').dataset.action = 'custom-discount';
        
        setTimeout(() => {
            document.getElementById('valueInput').focus();
        }, 100);
    }

    // FUNÇÃO CORRIGIDA - Limpar carrinho automaticamente ao sair
    exitSalesInterface() {
        console.log('Saindo do sistema de vendas...');
        
        // SEMPRE limpar carrinho ao sair - AUTOMÁTICO E SILENCIOSO
        this.cart = [];
        this.discount = 0;
        this.paymentMethods = [];
        this.totalPaid = 0;
        
        this.isActive = false;
        
        // Desativar sistema de atalhos
        this.shortcutSystem.deactivate();
        
        const salesInterface = document.getElementById('salesInterface');
        if (salesInterface) {
            salesInterface.style.display = 'none';
        }
        
        // Limpeza silenciosa - sem feedback visual
        this.goBackToHome();
    }

    goBackToHome() {
        // Voltar para home e resetar navegação
        document.querySelectorAll('#vendedorDashboard .nav-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-section') === 'home') {
                btn.classList.add('active');
            }
        });
        
        // Chamar função global de navegação se existir
        if (typeof window.showVendedorSection === 'function') {
            window.showVendedorSection('home');
        }
    }

    addSalesStyles() {
        if (document.getElementById('salesSystemStyles')) return;
        
        const style = document.createElement('style');
        style.id = 'salesSystemStyles';
        style.textContent = `
            .sales-container { 
                background: white; 
                border-radius: 15px; 
                padding: 30px; 
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1); 
            }
            
            .sales-header { 
                text-align: center; 
                margin-bottom: 30px; 
            }
            
            .sales-header h2 { 
                font-size: 28px; 
                color: #333; 
                margin-bottom: 15px; 
            }
            
            .sales-shortcuts { 
                background: #f8f9fa; 
                padding: 15px; 
                border-radius: 10px; 
                font-size: 13px; 
                color: #666; 
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .shortcut-group {
                display: flex;
                justify-content: center;
                gap: 15px;
                flex-wrap: wrap;
            }

            .shortcut-group span {
                display: flex;
                align-items: center;
                gap: 5px;
            }
            
            .sales-search-container { 
                position: relative; 
                margin-bottom: 30px; 
            }
            
            .search-with-quantity {
                display: flex;
                gap: 15px;
                align-items: end;
            }
            
            .quantity-selector {
                flex-shrink: 0;
            }
            
            .quantity-selector label {
                display: block;
                font-size: 12px;
                color: #666;
                margin-bottom: 5px;
                font-weight: bold;
            }
            
            .quick-quantity-input {
                width: 60px;
                padding: 15px 10px;
                border: 2px solid #007bff;
                border-radius: 10px;
                font-size: 16px;
                text-align: center;
                font-weight: bold;
            }
            
            .quick-quantity-input:focus {
                outline: none;
                box-shadow: 0 4px 15px rgba(0, 123, 255, 0.2);
            }
            
            .sales-search-input { 
                flex: 1;
                padding: 15px 20px; 
                border: 2px solid #007bff; 
                border-radius: 25px; 
                font-size: 16px; 
                box-shadow: 0 4px 15px rgba(0, 123, 255, 0.1); 
                box-sizing: border-box;
            }
            
            .sales-search-input:focus { 
                outline: none; 
                box-shadow: 0 6px 20px rgba(0, 123, 255, 0.2); 
            }
            
            .sales-search-results { 
                position: absolute; 
                top: 100%; 
                left: 0; 
                right: 0; 
                background: white; 
                border: 1px solid #ddd; 
                border-radius: 10px; 
                box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1); 
                max-height: 300px; 
                overflow-y: auto; 
                z-index: 1000; 
                display: none; 
                margin-top: 10px;
            }
            
            .search-result-item { 
                display: flex; 
                align-items: center; 
                padding: 15px; 
                cursor: pointer; 
                border-bottom: 1px solid #f0f0f0; 
                transition: all 0.3s ease; 
            }
            
            .search-result-item:hover { 
                background: #f8f9fa; 
            }
            
            .result-image { 
                width: 50px; 
                height: 50px; 
                border-radius: 8px; 
                margin-right: 15px; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                background: #f0f0f0; 
                font-size: 24px; 
                overflow: hidden; 
            }
            
            .result-image img { 
                width: 100%; 
                height: 100%; 
                object-fit: cover; 
                border-radius: 8px; 
            }
            
            .result-info { 
                flex: 1; 
            }
            
            .result-name { 
                font-weight: bold; 
                color: #333; 
                margin-bottom: 5px; 
            }
            
            .result-price { 
                color: #28a745; 
                font-weight: bold; 
                font-size: 16px; 
                margin-bottom: 3px; 
            }
            
            .result-ean { 
                color: #666; 
                font-size: 12px; 
            }
            
            .no-results { 
                padding: 20px; 
                text-align: center; 
                color: #666; 
                font-style: italic; 
            }
            
            .sales-cart { 
                background: #f8f9fa; 
                border-radius: 15px; 
                padding: 25px; 
            }
            
            .sales-cart h3 { 
                margin-bottom: 20px; 
                color: #333; 
                text-align: center; 
            }
            
            .cart-items { 
                margin-bottom: 25px; 
                max-height: 400px; 
                overflow-y: auto; 
            }
            
            .empty-cart { 
                text-align: center; 
                color: #666; 
                font-style: italic; 
                padding: 40px 20px; 
            }
            
            .cart-item { 
                display: flex; 
                align-items: center; 
                background: white; 
                border-radius: 10px; 
                padding: 15px; 
                margin-bottom: 15px; 
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); 
                gap: 15px; 
            }
            
            .cart-item-image { 
                width: 60px; 
                height: 60px; 
                border-radius: 8px; 
                background: #f0f0f0; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                font-size: 24px; 
                overflow: hidden; 
                flex-shrink: 0; 
            }
            
            .cart-item-image img { 
                width: 100%; 
                height: 100%; 
                object-fit: cover; 
                border-radius: 8px; 
            }
            
            .cart-item-info { 
                flex: 1; 
            }
            
            .cart-item-name { 
                font-weight: bold; 
                color: #333; 
                margin-bottom: 5px; 
            }
            
            .cart-item-price { 
                color: #666; 
                font-size: 14px; 
            }
            
            .cart-item-controls { 
                display: flex; 
                align-items: center; 
                gap: 10px; 
            }
            
            .qty-btn { 
                background: #007bff; 
                color: white; 
                border: none; 
                width: 30px; 
                height: 30px; 
                border-radius: 50%; 
                cursor: pointer; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                font-weight: bold; 
                transition: all 0.3s ease; 
            }
            
            .qty-btn:hover { 
                background: #0056b3; 
                transform: scale(1.1); 
            }
            
            .quantity { 
                font-weight: bold; 
                min-width: 30px; 
                text-align: center; 
            }
            
            .cart-item-total { 
                font-weight: bold; 
                color: #28a745; 
                font-size: 16px; 
                min-width: 80px; 
                text-align: right; 
            }
            
            .remove-item-btn { 
                background: #dc3545; 
                color: white; 
                border: none; 
                width: 35px; 
                height: 35px; 
                border-radius: 50%; 
                cursor: pointer; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                font-size: 20px; 
                font-weight: bold; 
                transition: all 0.3s ease; 
                flex-shrink: 0; 
            }
            
            .remove-item-btn:hover { 
                background: #c82333; 
                transform: scale(1.1); 
            }
            
            .cart-summary { 
                background: white; 
                border-radius: 10px; 
                padding: 20px; 
                margin-bottom: 25px; 
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); 
            }
            
            .summary-line { 
                display: flex; 
                justify-content: space-between; 
                padding: 8px 0; 
                border-bottom: 1px solid #f0f0f0; 
            }
            
            .summary-line:last-child { 
                border-bottom: none; 
            }
            
            .discount-line { 
                color: #dc3545; 
            }
            
            .total-line { 
                font-size: 18px; 
                color: #28a745; 
                border-top: 2px solid #28a745; 
                margin-top: 10px; 
                padding-top: 15px; 
            }
            
            .sales-buttons { 
                display: flex; 
                gap: 15px; 
                justify-content: center; 
                flex-wrap: wrap; 
            }
            
            .sales-btn { 
                background: linear-gradient(45deg, #007bff, #0056b3); 
                color: white; 
                border: none; 
                padding: 12px 20px; 
                border-radius: 25px; 
                cursor: pointer; 
                font-weight: bold; 
                transition: all 0.3s ease; 
                display: flex; 
                align-items: center; 
                gap: 10px; 
                min-width: 120px; 
                justify-content: center; 
            }
            
            .sales-btn:hover { 
                transform: translateY(-2px); 
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2); 
            }
            
            .multiple-btn {
                background: linear-gradient(45deg, #17a2b8, #138496);
            }
            
            .discount-btn { 
                background: linear-gradient(45deg, #ffc107, #e0a800); 
                color: #333; 
            }
            
            .clear-btn { 
                background: linear-gradient(45deg, #6c757d, #5a6268); 
            }
            
            .finish-btn { 
                background: linear-gradient(45deg, #28a745, #20c997); 
            }
            
            .btn-shortcut { 
                background: rgba(255, 255, 255, 0.2); 
                padding: 2px 6px; 
                border-radius: 4px; 
                font-size: 10px; 
                font-weight: bold; 
            }
            
            .back-to-home-btn { 
                background: #6c757d; 
                color: white; 
                border: none; 
                padding: 12px 25px; 
                border-radius: 25px; 
                cursor: pointer; 
                font-weight: bold; 
                margin-top: 30px; 
                display: block; 
                margin-left: auto; 
                margin-right: auto; 
                transition: all 0.3s ease; 
            }
            
            .back-to-home-btn:hover { 
                background: #5a6268; 
                transform: translateY(-2px); 
            }
            
            .sales-modal { 
                display: none; 
                position: fixed; 
                z-index: 2000; 
                left: 0; 
                top: 0; 
                width: 100%; 
                height: 100%; 
                background-color: rgba(0, 0, 0, 0.5); 
            }
            
            .sales-modal-content { 
                background-color: white; 
                margin: 10% auto; 
                padding: 30px; 
                border-radius: 15px; 
                width: 90%; 
                max-width: 500px; 
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3); 
                max-height: 80vh; 
                overflow-y: auto; 
            }
            
            .sales-modal-content h3 { 
                text-align: center; 
                margin-bottom: 25px; 
                color: #333; 
            }

            .multiple-add-container {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }

            .quantity-input-section label,
            .product-search-section label {
                display: block;
                font-weight: bold;
                margin-bottom: 8px;
                color: #333;
            }

            .multiple-quantity-input,
            .multiple-search-input {
                width: 100%;
                padding: 12px 15px;
                border: 2px solid #ddd;
                border-radius: 8px;
                font-size: 16px;
                box-sizing: border-box;
            }

            .multiple-quantity-input:focus,
            .multiple-search-input:focus {
                outline: none;
                border-color: #007bff;
            }

            .multiple-search-results {
                background: #f8f9fa;
                border: 1px solid #ddd;
                border-radius: 8px;
                max-height: 200px;
                overflow-y: auto;
                margin-top: 10px;
                display: none;
            }

            .multiple-preview {
                background: #e8f5e8;
                border: 1px solid #28a745;
                border-radius: 8px;
                padding: 15px;
            }

            .multiple-preview h4 {
                margin: 0 0 10px 0;
                color: #28a745;
            }

            .preview-product {
                display: flex;
                align-items: center;
                gap: 15px;
            }

            .preview-image {
                width: 50px;
                height: 50px;
                border-radius: 8px;
                background: #f0f0f0;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
                overflow: hidden;
            }

            .preview-image img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: 8px;
            }

            .preview-details {
                flex: 1;
            }

            .preview-name {
                font-weight: bold;
                color: #333;
                margin-bottom: 5px;
            }

            .preview-calculation {
                color: #28a745;
                font-weight: bold;
            }
            
            .discount-options { 
                display: grid; 
                grid-template-columns: 1fr 1fr; 
                gap: 15px; 
                margin-bottom: 25px; 
            }
            
            .discount-option { 
                background: white; 
                border: 2px solid #007bff; 
                border-radius: 10px; 
                padding: 20px; 
                cursor: pointer; 
                transition: all 0.3s ease; 
                text-align: center; 
            }
            
            .discount-option:hover { 
                background: #f8f9fa; 
                transform: translateY(-2px); 
            }
            
            .discount-option.custom-discount { 
                grid-column: span 2; 
            }
            
            .discount-value { 
                display: block; 
                font-size: 20px; 
                font-weight: bold; 
                color: #007bff; 
                margin-bottom: 5px; 
            }
            
            .discount-amount { 
                display: block; 
                color: #28a745; 
                font-weight: bold; 
            }
            
            .payment-modal { 
                max-width: 600px; 
            }
            
            .payment-summary { 
                background: #f8f9fa; 
                border-radius: 10px; 
                padding: 20px; 
                margin-bottom: 25px; 
                text-align: center; 
            }
            
            .payment-total { 
                font-size: 20px; 
                margin-bottom: 10px; 
                color: #333; 
            }
            
            .payment-remaining { 
                font-size: 16px; 
                color: #666; 
            }
            
            .payment-complete { 
                color: #28a745; 
                font-weight: bold; 
            }
            
            .payment-methods { 
                display: grid; 
                grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); 
                gap: 15px; 
                margin-bottom: 25px; 
            }
            
            .payment-method { 
                background: white; 
                border: 2px solid #007bff; 
                border-radius: 10px; 
                padding: 15px 10px; 
                cursor: pointer; 
                transition: all 0.3s ease; 
                text-align: center; 
                font-size: 12px; 
                font-weight: bold; 
            }
            
            .payment-method:hover { 
                background: #007bff; 
                color: white; 
                transform: translateY(-2px); 
            }
            
            .payment-list { 
                background: #f8f9fa; 
                border-radius: 10px; 
                padding: 15px; 
                margin-bottom: 25px; 
                max-height: 200px; 
                overflow-y: auto; 
            }
            
            .payment-list-header h4 { 
                margin: 0 0 15px 0; 
                color: #333; 
            }
            
            .payment-item { 
                display: flex; 
                align-items: center; 
                justify-content: space-between; 
                padding: 10px; 
                background: white; 
                border-radius: 8px; 
                margin-bottom: 10px; 
                gap: 10px; 
            }
            
            .payment-method-name { 
                font-weight: bold; 
                color: #333; 
            }
            
            .payment-amount { 
                color: #28a745; 
                font-weight: bold; 
            }
            
            .payment-change { 
                color: #007bff; 
                font-size: 12px; 
                font-style: italic; 
            }
            
            .remove-payment-btn { 
                background: #dc3545; 
                color: white; 
                border: none; 
                width: 25px; 
                height: 25px; 
                border-radius: 50%; 
                cursor: pointer; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                font-size: 16px; 
                font-weight: bold; 
            }
            
            .remove-payment-btn:hover { 
                background: #c82333; 
            }
            
            .value-input-modal { 
                max-width: 400px; 
            }
            
            .value-input-container { 
                margin-bottom: 25px; 
            }
            
            .value-input-container label { 
                display: block; 
                margin-bottom: 10px; 
                font-weight: bold; 
                color: #333; 
            }
            
            .value-input-container input { 
                width: 100%; 
                padding: 12px 15px; 
                border: 2px solid #ddd; 
                border-radius: 8px; 
                font-size: 16px; 
                box-sizing: border-box;
            }
            
            .value-input-container input:focus { 
                outline: none; 
                border-color: #007bff; 
            }
            
            .modal-buttons { 
                display: flex; 
                gap: 15px; 
                justify-content: center; 
                flex-wrap: wrap; 
            }
            
            .modal-btn { 
                padding: 12px 25px; 
                border: none; 
                border-radius: 25px; 
                cursor: pointer; 
                font-weight: bold; 
                transition: all 0.3s ease; 
                display: flex; 
                align-items: center; 
                gap: 8px; 
                min-width: 120px; 
                justify-content: center; 
            }
            
            .cancel-btn { 
                background: #6c757d; 
                color: white; 
            }
            
            .cancel-btn:hover { 
                background: #5a6268; 
            }
            
            .confirm-btn { 
                background: #28a745; 
                color: white; 
            }
            
            .confirm-btn:hover { 
                background: #20c997; 
            }
            
            .remove-btn { 
                background: #dc3545; 
                color: white; 
            }
            
            .remove-btn:hover { 
                background: #c82333; 
            }

            .add-to-cart-feedback {
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                color: white;
                padding: 15px 20px;
                border-radius: 10px;
                box-shadow: 0 5px 20px rgba(40, 167, 69, 0.4);
                z-index: 10000;
                opacity: 0;
                transform: translateX(100%);
                transition: all 0.3s ease;
                max-width: 300px;
                font-weight: bold;
            }

            .add-to-cart-feedback.show {
                opacity: 1;
                transform: translateX(0);
            }

            .add-to-cart-feedback .feedback-content {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .add-to-cart-feedback .quantity-badge {
                background: rgba(255, 255, 255, 0.3);
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 12px;
                min-width: 20px;
                text-align: center;
            }

            .cart-warning {
                margin-top: 10px;
            }

            .cart-warning div {
                background: #fff3cd !important;
                border: 1px solid #ffc107 !important;
                border-radius: 8px !important;
                padding: 10px !important;
                color: #856404 !important;
                font-size: 13px;
                line-height: 1.4;
            }

            .search-result-item.in-cart {
                background: #e8f5e8 !important;
                border-left: 4px solid #28a745;
            }

            .search-result-item.in-cart::after {
                content: "✓ No carrinho";
                position: absolute;
                top: 10px;
                right: 10px;
                background: #28a745;
                color: white;
                padding: 2px 8px;
                border-radius: 10px;
                font-size: 11px;
                font-weight: bold;
            }
            
            @media (max-width: 768px) {
                .search-with-quantity {
                    flex-direction: column;
                    align-items: stretch;
                    gap: 10px;
                }
                
                .quantity-selector {
                    align-self: center;
                }

                .shortcut-group {
                    flex-direction: column;
                    align-items: center;
                    gap: 5px;
                }
                
                .sales-modal-content { 
                    margin: 5% auto; 
                    padding: 20px; 
                    width: 95%; 
                    max-height: 90vh; 
                }
                
                .discount-options { 
                    grid-template-columns: 1fr; 
                }
                
                .discount-option.custom-discount { 
                    grid-column: span 1; 
                }
                
                .payment-methods { 
                    grid-template-columns: repeat(2, 1fr); 
                }
                
                .sales-buttons { 
                    flex-direction: column; 
                }
                
                .cart-item { 
                    flex-wrap: wrap; 
                    gap: 10px; 
                }
                
                .cart-item-controls { 
                    order: 1; 
                    width: 100%; 
                    justify-content: center; 
                }
                
                .cart-item-total { 
                    order: 2; 
                    width: 100%; 
                    text-align: center; 
                    margin-top: 10px; 
                }
            }
        `;
        
        document.head.appendChild(style);
    }
}

// Instanciar e usar - Integração completa
window.improvedShortcuts = new ImprovedShortcutSystem();
window.salesSystem = new SalesSystem();

// Auto-inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.salesSystem.init();
});