// Sistema de Alertas de Vencimento para produtos do vendedor
// Arquivo: expiry-alerts.js

// Função para verificar status de vencimento de uma data específica
function getExpiryStatus(dateString) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Converter string DD/MM/YYYY para Date
    const parts = dateString.split('/');
    if (parts.length !== 3) return { status: 'valid', daysUntilExpiry: 999, message: '' };
    
    const expiryDate = new Date(parts[2], parts[1] - 1, parts[0]);
    expiryDate.setHours(0, 0, 0, 0);
    
    const diffTime = expiryDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
        return {
            status: 'expired',
            daysUntilExpiry: diffDays,
            message: `Venceu há ${Math.abs(diffDays)} dia(s)`
        };
    } else if (diffDays === 0) {
        return {
            status: 'expires-today',
            daysUntilExpiry: diffDays,
            message: 'Vence hoje!'
        };
    } else if (diffDays <= 7) {
        return {
            status: 'expiring-soon',
            daysUntilExpiry: diffDays,
            message: `Vence em ${diffDays} dia(s)`
        };
    } else {
        return {
            status: 'valid',
            daysUntilExpiry: diffDays,
            message: ''
        };
    }
}

// Função para verificar produtos próximos do vencimento
function checkExpiringProducts() {
    const expiringProducts = [];
    const expiredProducts = [];
    
    vendedorProducts.forEach(product => {
        product.validades.forEach(validade => {
            const status = getExpiryStatus(validade.data);
            
            if (status.status === 'expired') {
                expiredProducts.push({
                    product,
                    validade,
                    status
                });
            } else if (status.status === 'expires-today' || status.status === 'expiring-soon') {
                expiringProducts.push({
                    product,
                    validade,
                    status
                });
            }
        });
    });
    
    return { expiringProducts, expiredProducts };
}

// Função para mostrar alerta de vencimentos
function checkAndAlertExpiry() {
    const { expiringProducts, expiredProducts } = checkExpiringProducts();
    
    if (expiredProducts.length === 0 && expiringProducts.length === 0) {
        return; // Não há alertas
    }
    
    let alertMessage = '';
    
    if (expiredProducts.length > 0) {
        alertMessage += `❌ ${expiredProducts.length} produto(s) vencido(s):\n`;
        expiredProducts.slice(0, 3).forEach(item => {
            alertMessage += `• ${item.product.nomeProduto} (${item.status.message})\n`;
        });
        if (expiredProducts.length > 3) {
            alertMessage += `... e mais ${expiredProducts.length - 3} produto(s)\n`;
        }
        alertMessage += '\n';
    }
    
    if (expiringProducts.length > 0) {
        alertMessage += `⚠️ ${expiringProducts.length} produto(s) próximo(s) do vencimento:\n`;
        expiringProducts.slice(0, 3).forEach(item => {
            alertMessage += `• ${item.product.nomeProduto} (${item.status.message})\n`;
        });
        if (expiringProducts.length > 3) {
            alertMessage += `... e mais ${expiringProducts.length - 3} produto(s)\n`;
        }
    }
    
    // Usar a função de notificação do seu sistema
    if (window.FormUtils && window.FormUtils.showNotification) {
        window.FormUtils.showNotification(alertMessage.trim(), 'error');
    } else {
        alert(alertMessage);
    }
}

// Função para aplicar filtro de vencimento (mostrar apenas produtos próximos do vencimento)
function applyExpiryFilter() {
    const { expiringProducts, expiredProducts } = checkExpiringProducts();
    const problematicProductIds = new Set();
    
    // Coletar IDs dos produtos com problemas
    [...expiringProducts, ...expiredProducts].forEach(item => {
        problematicProductIds.add(item.product.id);
    });
    
    // Filtrar produtos
    const originalProducts = [...vendedorProducts];
    vendedorProducts = vendedorProducts.filter(product => 
        problematicProductIds.has(product.id)
    );
    
    // Renderizar apenas produtos com problemas
    renderVendedorProducts();
    
    // Adicionar botão para voltar à visualização normal
    addClearFilterButton(originalProducts);
    
    // Atualizar informações de pesquisa
    const searchInfo = document.getElementById('vendedorSearchInfo');
    if (searchInfo) {
        searchInfo.innerHTML = `Mostrando apenas produtos próximos do vencimento (${vendedorProducts.length} produto(s))`;
        searchInfo.style.color = '#dc3545';
        searchInfo.style.fontWeight = 'bold';
    }
}

// Função para adicionar botão de limpar filtro
function addClearFilterButton(originalProducts) {
    const searchContainer = document.getElementById('vendedorSearchContainer');
    if (searchContainer && !document.getElementById('clearFilterBtn')) {
        const clearBtn = document.createElement('button');
        clearBtn.id = 'clearFilterBtn';
        clearBtn.innerHTML = '✖ Limpar Filtro de Vencimento';
        clearBtn.className = 'clear-filter-btn';
        clearBtn.style.cssText = `
            background: #6c757d;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 20px;
            margin: 10px auto;
            display: block;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.3s ease;
        `;
        
        clearBtn.onclick = function() {
            // Restaurar produtos originais
            vendedorProducts = originalProducts;
            renderVendedorProducts();
            
            // Remover botão
            this.remove();
            
            // Restaurar navegação
            document.querySelectorAll('#vendedorDashboard .nav-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.getAttribute('data-section') === 'home') {
                    btn.classList.add('active');
                }
            });
            
            // Remover classe active do botão de vencimento se existir
            const expiryBtn = document.getElementById('expiryCheckBtn');
            if (expiryBtn) {
                expiryBtn.classList.remove('active');
            }
        };
        
        clearBtn.onmouseover = function() {
            this.style.background = '#5a6268';
            this.style.transform = 'translateY(-2px)';
        };
        
        clearBtn.onmouseout = function() {
            this.style.background = '#6c757d';
            this.style.transform = 'translateY(0)';
        };
        
        searchContainer.appendChild(clearBtn);
    }
}

// Adicionar estilos CSS para indicadores visuais de vencimento
function addExpiryIndicatorStyles() {
    if (document.getElementById('expiryIndicatorStyles')) return;
    
    const style = document.createElement('style');
    style.id = 'expiryIndicatorStyles';
    style.textContent = `
        .expiry-badge {
            position: absolute;
            top: 10px;
            right: 10px;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
            color: white;
            z-index: 10;
        }
        
        .expiry-badge.expired {
            background: #dc3545;
            animation: blink 1.5s infinite;
        }
        
        .expiry-badge.expires-today {
            background: #fd7e14;
            animation: pulse 2s infinite;
        }
        
        .expiry-badge.expiring-soon {
            background: #ffc107;
            color: #333;
        }
        
        .expired-product {
            border: 2px solid #dc3545 !important;
            box-shadow: 0 0 10px rgba(220, 53, 69, 0.3) !important;
        }
        
        .expires-today-product {
            border: 2px solid #fd7e14 !important;
            box-shadow: 0 0 10px rgba(253, 126, 20, 0.3) !important;
        }
        
        .expiring-soon-product {
            border: 2px solid #ffc107 !important;
            box-shadow: 0 0 10px rgba(255, 193, 7, 0.3) !important;
        }
        
        .expiry-info {
            background: #f8f9fa;
            padding: 8px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: bold;
            margin-top: 10px;
            text-align: center;
        }
        
        .expired-product .expiry-info {
            background: #f8d7da;
            color: #721c24;
        }
        
        .expires-today-product .expiry-info {
            background: #ffeaa7;
            color: #856404;
        }
        
        .expiring-soon-product .expiry-info {
            background: #fff3cd;
            color: #856404;
        }
        
        @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0.5; }
        }
        
        @keyframes pulse {
            0% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.05); }
            100% { opacity: 1; transform: scale(1); }
        }
        
        .expiry-check-btn {
            transition: all 0.3s ease !important;
        }
        
        .expiry-check-btn:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2) !important;
        }
        
        @keyframes buttonPulse {
            0% { opacity: 1; }
            50% { opacity: 0.8; }
            100% { opacity: 1; }
        }
    `;
    
    document.head.appendChild(style);
}

// Função para inicializar o sistema de alertas
function initExpiryAlertSystem() {
    // Adicionar estilos
    addExpiryIndicatorStyles();
    
    console.log('Sistema de alertas de vencimento inicializado!');
}

// Exportar funções para uso global
if (typeof window !== 'undefined') {
    window.ExpiryAlerts = {
        getExpiryStatus,
        checkExpiringProducts,
        checkAndAlertExpiry,
        applyExpiryFilter,
        init: initExpiryAlertSystem
    };
}