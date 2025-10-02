// Sistema de Rastreamento de Estoque - VERSÃO CORRIGIDA
class InventoryTrackingSystem {
    constructor() {
        this.salesHistory = [];
        this.lastStockUpdate = new Date();
        this.isEnabled = true;
        this.init();
    }

    init() {
        this.addInventoryStyles();
        console.log('Sistema de Rastreamento de Vendas inicializado!');
    }

    // Função principal chamada ao finalizar venda - CORRIGIDA
    processSale(cartItems) {
        if (!this.isEnabled) return;
        
        const saleRecord = {
            id: Date.now(),
            timestamp: new Date(),
            items: cartItems.map(item => ({
                productId: item.id,
                productName: item.name,
                quantitySold: item.quantity,
                price: item.price
            })),
            total: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        };

        // Processar cada item do carrinho - PERMITIR VENDAS MESMO COM ESTOQUE ZERADO
        cartItems.forEach(cartItem => {
            this.trackSale(cartItem.id, cartItem.quantity);
        });

        // Registrar venda no histórico
        this.salesHistory.push(saleRecord);

        // Atualizar visualização dos produtos
        if (typeof renderVendedorProducts === 'function') {
            renderVendedorProducts();
        }

        // Mostrar resumo da venda
        this.showSaleImpactSummary(saleRecord);

        console.log('Venda processada:', saleRecord);
        console.log('Produtos atualizados:', window.vendedorProducts);
    }

    // Rastrear vendas e atualizar estoque - CORRIGIDO PARA PERMITIR ESTOQUE NEGATIVO
    trackSale(productId, quantitySold) {
        const product = window.vendedorProducts.find(p => p.id === productId);
        if (!product) {
            console.warn('Produto não encontrado:', productId);
            return;
        }

        console.log(`Processando venda de ${quantitySold} unidades do produto:`, product.nomeProduto);

        // Situação 1: Apenas UMA data de validade - PERMITIR ESTOQUE NEGATIVO
        if (product.validades.length === 1) {
            const validade = product.validades[0];
            const estoqueAnterior = validade.quantidade;
            validade.quantidade -= quantitySold;
            
            console.log(`✓ Removido ${quantitySold} unidades do lote ${validade.data} (sobram: ${validade.quantidade})`);
            
            // Se ficou negativo, mostrar aviso mas continuar venda
            if (validade.quantidade < 0) {
                console.warn(`⚠️ Estoque negativo para ${product.nomeProduto}: ${validade.quantidade}`);
                // Não mostrar alert, apenas logar - venda deve continuar
            }
            
            // Se zerou ou ficou negativo, não remover a validade - manter para controle
        } 
        // Situação 2: MÚLTIPLAS datas - ADICIONAR LABEL E PERMITIR VENDA
        else if (product.validades.length > 1) {
            // Calcular estoque total (pode ser negativo)
            const estoqueTotal = product.validades.reduce((sum, v) => sum + v.quantidade, 0);
            
            // Inicializar contador se não existir
            if (!product.vendidosDesdeUltimaAtualizacao) {
                product.vendidosDesdeUltimaAtualizacao = 0;
            }
            
            // Adicionar à contagem - SEMPRE PERMITIR
            product.vendidosDesdeUltimaAtualizacao += quantitySold;
            
            console.log(`✓ Marcado ${quantitySold} vendas para ${product.nomeProduto}`);
            console.log(`📊 Total vendido desde última atualização: ${product.vendidosDesdeUltimaAtualizacao}`);
            
            if (estoqueTotal < quantitySold) {
                console.warn(`⚠️ Estoque insuficiente mas venda permitida - ${product.nomeProduto}: disponível ${estoqueTotal}, vendido ${quantitySold}`);
            }
        }
        // Situação 3: SEM estoque - CRIAR ENTRADA NEGATIVA
        else {
            // Criar uma entrada com quantidade negativa para rastrear vendas sem estoque
            product.validades.push({
                data: 'SEM_ESTOQUE',
                quantidade: -quantitySold
            });
            
            console.log(`⚠️ Venda sem estoque registrada: ${product.nomeProduto} - ${quantitySold} unidades`);
        }
    }

    // Mostrar resumo do impacto da venda - CORRIGIDO
    showSaleImpactSummary(saleRecord) {
        let summary = '📊 RESUMO DO IMPACTO NO ESTOQUE\n';
        summary += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
        
        saleRecord.items.forEach(item => {
            const product = window.vendedorProducts.find(p => p.id === item.productId);
            if (!product) return;
            
            summary += `${item.productName}:\n`;
            
            if (product.validades.length === 0) {
                summary += `  ⚠️ SEM ESTOQUE CADASTRADO\n`;
            } else if (product.validades.length === 1) {
                const estoque = product.validades[0].quantidade;
                if (estoque < 0) {
                    summary += `  ⚠️ ESTOQUE NEGATIVO: ${estoque} unidades\n`;
                } else if (estoque === 0) {
                    summary += `  ⚠️ ESTOQUE ZERADO\n`;
                } else {
                    summary += `  ✓ Estoque atualizado: ${estoque} unidades\n`;
                }
            } else {
                const estoqueTotal = product.validades.reduce((sum, v) => sum + v.quantidade, 0);
                summary += `  📦 Estoque total: ${estoqueTotal} unidades\n`;
                summary += `  📝 Vendidos (aguardando atualização): ${product.vendidosDesdeUltimaAtualizacao}\n`;
            }
            summary += '\n';
        });
        
        console.log(summary);
    }

    // Adicionar estilos para as labels - INCLUIR AVISO LARANJA
    addInventoryStyles() {
        if (document.getElementById('inventoryTrackingStyles')) return;
        
        const style = document.createElement('style');
        style.id = 'inventoryTrackingStyles';
        style.textContent = `
            .pending-sales-label {
                background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
                color: white;
                padding: 8px 12px;
                border-radius: 8px;
                font-size: 13px;
                font-weight: bold;
                margin-top: 10px;
                display: flex;
                align-items: center;
                gap: 8px;
                box-shadow: 0 2px 8px rgba(255, 152, 0, 0.3);
                animation: pulseGlow 2s infinite;
            }

            .pending-sales-label::before {
                content: "📝";
                font-size: 16px;
            }

            /* NOVO: Label de aviso laranja para datas de validade */
            .expiry-warning-label {
                background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
                color: white;
                padding: 6px 10px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: bold;
                margin-top: 8px;
                display: flex;
                align-items: center;
                gap: 6px;
                box-shadow: 0 2px 8px rgba(255, 152, 0, 0.3);
            }

            .expiry-warning-label::before {
                content: "⚠️";
                font-size: 14px;
            }

            .stock-updated-label {
                background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                color: white;
                padding: 6px 10px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: bold;
                margin-top: 8px;
                display: flex;
                align-items: center;
                gap: 6px;
            }

            .stock-updated-label::before {
                content: "✓";
                font-size: 14px;
            }

            .negative-stock-label {
                background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
                color: white;
                padding: 8px 12px;
                border-radius: 8px;
                font-size: 13px;
                font-weight: bold;
                margin-top: 10px;
                display: flex;
                align-items: center;
                gap: 8px;
                animation: shake 0.5s infinite;
            }

            .negative-stock-label::before {
                content: "⚠️";
                font-size: 16px;
            }

            .out-of-stock-label {
                background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
                color: white;
                padding: 8px 12px;
                border-radius: 8px;
                font-size: 13px;
                font-weight: bold;
                margin-top: 10px;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .out-of-stock-label::before {
                content: "📦";
                font-size: 16px;
            }

            @keyframes pulseGlow {
                0%, 100% {
                    opacity: 1;
                    transform: scale(1);
                }
                50% {
                    opacity: 0.9;
                    transform: scale(1.02);
                }
            }

            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-3px); }
                75% { transform: translateX(3px); }
            }

            .stock-info-detailed {
                background: #f8f9fa;
                border-left: 4px solid #007bff;
                padding: 10px;
                margin-top: 10px;
                border-radius: 4px;
                font-size: 12px;
                color: #333;
            }

            .stock-info-detailed .stock-line {
                display: flex;
                justify-content: space-between;
                margin: 4px 0;
            }

            .stock-info-detailed .stock-date {
                font-weight: bold;
                color: #666;
            }

            .stock-info-detailed .stock-qty {
                color: #28a745;
                font-weight: bold;
            }

            .stock-info-detailed .stock-qty.negative {
                color: #dc3545;
            }
        `;
        
        document.head.appendChild(style);
    }

    // Função auxiliar para resetar contadores
    resetPendingSales(productId) {
        const product = window.vendedorProducts.find(p => p.id === productId);
        if (product && product.vendidosDesdeUltimaAtualizacao) {
            product.vendidosDesdeUltimaAtualizacao = 0;
            console.log(`✓ Contador resetado para ${product.nomeProduto}`);
            
            if (typeof renderVendedorProducts === 'function') {
                renderVendedorProducts();
            }
        }
    }

    // Função para obter estatísticas
    getInventoryStats() {
        const stats = {
            totalProducts: window.vendedorProducts.length,
            productsWithStock: 0,
            productsOutOfStock: 0,
            productsWithNegativeStock: 0,
            productsWithPendingSales: 0,
            totalPendingSales: 0
        };

        window.vendedorProducts.forEach(product => {
            const estoqueTotal = product.validades.reduce((sum, v) => sum + v.quantidade, 0);
            
            if (estoqueTotal > 0) {
                stats.productsWithStock++;
            } else if (estoqueTotal < 0) {
                stats.productsWithNegativeStock++;
            } else {
                stats.productsOutOfStock++;
            }

            if (product.vendidosDesdeUltimaAtualizacao && product.vendidosDesdeUltimaAtualizacao > 0) {
                stats.productsWithPendingSales++;
                stats.totalPendingSales += product.vendidosDesdeUltimaAtualizacao;
            }
        });

        return stats;
    }
}

// Função auxiliar para adicionar labels aos cards dos produtos - CORRIGIDA
function addInventoryLabelsToProductCard(product, cardElement) {
    if (!window.inventorySystem) return;

    // Remover labels antigas
    const oldLabels = cardElement.querySelectorAll('.pending-sales-label, .stock-updated-label, .negative-stock-label, .out-of-stock-label, .stock-info-detailed, .expiry-warning-label');
    oldLabels.forEach(label => label.remove());

    const estoqueTotal = product.validades.reduce((sum, v) => sum + v.quantidade, 0);

    // Caso 1: Estoque negativo
    if (estoqueTotal < 0) {
        const label = document.createElement('div');
        label.className = 'negative-stock-label';
        label.textContent = `ESTOQUE NEGATIVO: ${estoqueTotal} unidades`;
        cardElement.appendChild(label);
    }
    // Caso 2: Sem estoque (zero)
    else if (estoqueTotal === 0) {
        const label = document.createElement('div');
        label.className = 'out-of-stock-label';
        label.textContent = 'ESTOQUE ZERADO';
        cardElement.appendChild(label);
    }
    // Caso 3: Múltiplas datas COM vendas pendentes
    else if (product.validades.length > 1 && product.vendidosDesdeUltimaAtualizacao > 0) {
        const label = document.createElement('div');
        label.className = 'pending-sales-label';
        label.textContent = `${product.vendidosDesdeUltimaAtualizacao} vendidos (atualizar estoque)`;
        cardElement.appendChild(label);

        // Adicionar informações detalhadas
        const detailedInfo = document.createElement('div');
        detailedInfo.className = 'stock-info-detailed';
        detailedInfo.innerHTML = `
            <div class="stock-line">
                <span class="stock-date">Estoque Total:</span>
                <span class="stock-qty">${estoqueTotal} unidades</span>
            </div>
        `;
        cardElement.appendChild(detailedInfo);
    }
    // Caso 4: Uma data com estoque positivo
    else if (product.validades.length === 1 && estoqueTotal > 0) {
        const label = document.createElement('div');
        label.className = 'stock-updated-label';
        label.textContent = `Estoque: ${product.validades[0].quantidade} unidades`;
        cardElement.appendChild(label);
    }
    
    // NOVO: Verificar se há datas de validade que precisam de atenção
    if (product.validades.length > 1) {
        const hasMultipleDates = product.validades.filter(v => v.data !== 'SEM_ESTOQUE').length > 1;
        if (hasMultipleDates) {
            const warningLabel = document.createElement('div');
            warningLabel.className = 'expiry-warning-label';
            warningLabel.textContent = 'Múltiplas datas - Verificar validades';
            cardElement.appendChild(warningLabel);
        }
    }
}

// Instanciar globalmente
if (typeof window !== 'undefined') {
    window.inventorySystem = new InventoryTrackingSystem();
    window.addInventoryLabelsToProductCard = addInventoryLabelsToProductCard;
}