class SalesReportsSystem {
    constructor() {
        // Usar array em memória ao invés de localStorage
        this.salesHistory = [];
        this.isActive = false;
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.addReportsStyles();
        console.log('Sistema de Relatórios inicializado!');
    }

    // Registrar uma nova venda - CHAMADO PELO SISTEMA DE VENDAS
    registerSale(saleData) {
        const saleRecord = {
            id: Date.now() + Math.random(),
            timestamp: new Date(),
            date: new Date().toLocaleDateString('pt-BR'),
            time: new Date().toLocaleTimeString('pt-BR'),
            items: saleData.items.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                total: item.price * item.quantity
            })),
            subtotal: saleData.subtotal,
            discount: saleData.discount || 0,
            discountPercent: saleData.discountPercent || 0,
            total: saleData.total,
            paymentMethods: saleData.paymentMethods.map(pm => ({
                method: pm.method,
                name: pm.name,
                amount: pm.amount,
                change: pm.change || 0
            })),
            totalPaid: saleData.totalPaid,
            totalChange: saleData.paymentMethods.reduce((sum, p) => sum + (p.change || 0), 0)
        };

        this.salesHistory.unshift(saleRecord);
        
        console.log('Venda registrada no relatório:', saleRecord);
        
        // Se o relatório estiver aberto, atualizar
        if (this.isActive) {
            this.renderReports();
        }

        return saleRecord;
    }

    // Mostrar interface de relatórios
    showReportsInterface() {
        this.isActive = true;
        
        const vendedorContent = document.getElementById('vendedorContent');
        
        // Esconder outros elementos
        const logo = vendedorContent.querySelector('.dashboard-logo');
        const productsList = document.getElementById('vendedorProductsList');
        const searchContainer = document.getElementById('vendedorSearchContainer');
        const productForm = document.getElementById('vendedorProductForm');
        const salesInterface = document.getElementById('salesInterface');
        
        if (logo) logo.style.display = 'none';
        if (productsList) productsList.classList.remove('show');
        if (searchContainer) searchContainer.classList.remove('show');
        if (productForm) productForm.style.display = 'none';
        if (salesInterface) salesInterface.style.display = 'none';
        
        // Criar interface de relatórios
        let reportsInterface = document.getElementById('reportsInterface');
        if (!reportsInterface) {
            reportsInterface = document.createElement('div');
            reportsInterface.id = 'reportsInterface';
            vendedorContent.appendChild(reportsInterface);
        }
        
        reportsInterface.innerHTML = this.getReportsInterfaceHTML();
        reportsInterface.style.display = 'block';
        
        this.renderReports();
        this.setupReportsEventListeners();
    }

    getReportsInterfaceHTML() {
        return `
            <div class="reports-container">
                <div class="reports-header">
                    <h2>📊 Relatórios de Vendas</h2>
                    <button class="back-to-home-btn" onclick="window.reportsSystem.exitReportsInterface()">
                        ← Voltar ao Home
                    </button>
                </div>
                
                <div class="reports-filters">
                    <button class="filter-btn active" data-filter="all">Todas</button>
                    <button class="filter-btn" data-filter="today">Hoje</button>
                    <button class="filter-btn" data-filter="week">Esta Semana</button>
                    <button class="filter-btn" data-filter="month">Este Mês</button>
                </div>
                
                <div class="reports-summary" id="reportsSummary"></div>
                <div class="reports-list" id="reportsList"></div>
            </div>
            
            <div id="receiptModal" class="reports-modal">
                <div class="reports-modal-content receipt-modal">
                    <div class="modal-header">
                        <h3>📄 Recibo da Venda</h3>
                        <button class="close-modal-btn" onclick="window.reportsSystem.closeReceiptModal()">×</button>
                    </div>
                    <div class="receipt-content" id="receiptContent"></div>
                    <div class="receipt-actions">
                        <button class="modal-btn print-btn" onclick="window.reportsSystem.printReceipt()">🖨️ Imprimir</button>
                        <button class="modal-btn close-btn" onclick="window.reportsSystem.closeReceiptModal()">Fechar</button>
                    </div>
                </div>
            </div>
        `;
    }

    setupReportsEventListeners() {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.renderReports();
            });
        });
    }

    getFilteredSales() {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        return this.salesHistory.filter(sale => {
            const saleDate = new Date(sale.timestamp);
            
            switch (this.currentFilter) {
                case 'today':
                    return saleDate >= today;
                case 'week':
                    const weekAgo = new Date(today);
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return saleDate >= weekAgo;
                case 'month':
                    const monthAgo = new Date(today);
                    monthAgo.setMonth(monthAgo.getMonth() - 1);
                    return saleDate >= monthAgo;
                default:
                    return true;
            }
        });
    }

    renderReports() {
        const filteredSales = this.getFilteredSales();
        this.renderSummary(filteredSales);
        this.renderSalesList(filteredSales);
    }

    renderSummary(sales) {
        const summary = this.calculateSummary(sales);
        const summaryContainer = document.getElementById('reportsSummary');
        
        let periodText = 'Total Geral';
        switch (this.currentFilter) {
            case 'today': periodText = 'Hoje'; break;
            case 'week': periodText = 'Esta Semana'; break;
            case 'month': periodText = 'Este Mês'; break;
        }
        
        summaryContainer.innerHTML = `
            <div class="summary-card">
                <div class="summary-period">${periodText}</div>
                <div class="summary-stats">
                    <div class="stat-item">
                        <div class="stat-label">Vendas</div>
                        <div class="stat-value">${summary.totalSales}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Faturamento</div>
                        <div class="stat-value">R$ ${summary.totalRevenue.toFixed(2)}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Itens Vendidos</div>
                        <div class="stat-value">${summary.totalItems}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Desconto Total</div>
                        <div class="stat-value">R$ ${summary.totalDiscount.toFixed(2)}</div>
                    </div>
                </div>
                ${Object.keys(summary.paymentMethods).length > 0 ? `
                    <div class="payment-methods-summary">
                        <h4>Formas de Pagamento:</h4>
                        <div class="payment-stats">
                            ${Object.entries(summary.paymentMethods).map(([method, amount]) => `
                                <div class="payment-stat">
                                    <span class="payment-method">${this.getPaymentMethodName(method)}:</span>
                                    <span class="payment-amount">R$ ${amount.toFixed(2)}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    calculateSummary(sales) {
        const summary = {
            totalSales: sales.length,
            totalRevenue: 0,
            totalItems: 0,
            totalDiscount: 0,
            paymentMethods: {}
        };

        sales.forEach(sale => {
            summary.totalRevenue += sale.total;
            summary.totalItems += sale.items.reduce((sum, item) => sum + item.quantity, 0);
            summary.totalDiscount += sale.discount;

            sale.paymentMethods.forEach(payment => {
                if (!summary.paymentMethods[payment.method]) {
                    summary.paymentMethods[payment.method] = 0;
                }
                summary.paymentMethods[payment.method] += payment.amount;
            });
        });

        return summary;
    }

    renderSalesList(sales) {
        const listContainer = document.getElementById('reportsList');
        
        if (sales.length === 0) {
            listContainer.innerHTML = `
                <div class="no-sales">
                    <div class="no-sales-icon">📊</div>
                    <div class="no-sales-text">
                        ${this.salesHistory.length === 0 
                            ? 'Nenhuma venda registrada ainda. Faça uma venda para ver os relatórios aqui!' 
                            : 'Nenhuma venda encontrada para o período selecionado'}
                    </div>
                </div>
            `;
            return;
        }

        listContainer.innerHTML = sales.map(sale => `
            <div class="sale-item" onclick="window.reportsSystem.showReceiptModal('${sale.id}')">
                <div class="sale-header">
                    <div class="sale-date-time">
                        <div class="sale-date">${sale.date}</div>
                        <div class="sale-time">${sale.time}</div>
                    </div>
                    <div class="sale-total">R$ ${sale.total.toFixed(2)}</div>
                </div>
                <div class="sale-details">
                    <div class="sale-items">
                        ${sale.items.length} item(ns): ${sale.items.map(item => `${item.name} (${item.quantity}x)`).join(', ')}
                    </div>
                    <div class="sale-payment">
                        ${sale.paymentMethods.map(p => this.getPaymentMethodName(p.method)).join(', ')}
                        ${sale.totalChange > 0 ? `| Troco: R$ ${sale.totalChange.toFixed(2)}` : ''}
                    </div>
                </div>
                ${sale.discount > 0 ? `
                    <div class="sale-discount">
                        Desconto: ${sale.discountPercent}% (R$ ${sale.discount.toFixed(2)})
                    </div>
                ` : ''}
            </div>
        `).join('');
    }

    showReceiptModal(saleId) {
        const sale = this.salesHistory.find(s => s.id == saleId);
        if (!sale) return;

        const receiptContent = this.generateReceiptHTML(sale);
        document.getElementById('receiptContent').innerHTML = receiptContent;
        document.getElementById('receiptModal').style.display = 'block';
    }

    generateReceiptHTML(sale) {
        return `
            <div class="receipt">
                <div class="receipt-header">
                    <h2>SYSTEM CODE</h2>
                    <div class="receipt-title">RECIBO DE VENDA</div>
                    <div class="receipt-line"></div>
                </div>
                
                <div class="receipt-info">
                    <div class="receipt-datetime">
                        <span>Data: ${sale.date}</span>
                        <span>Horário: ${sale.time}</span>
                    </div>
                    <div class="receipt-id">Venda #${sale.id.toString().slice(-8)}</div>
                </div>
                
                <div class="receipt-items">
                    <div class="items-header">
                        <span>PRODUTO</span>
                        <span>QTD</span>
                        <span>VALOR</span>
                        <span>TOTAL</span>
                    </div>
                    ${sale.items.map(item => `
                        <div class="receipt-item">
                            <span class="item-name">${item.name}</span>
                            <span class="item-qty">${item.quantity}</span>
                            <span class="item-price">R$ ${item.price.toFixed(2)}</span>
                            <span class="item-total">R$ ${item.total.toFixed(2)}</span>
                        </div>
                    `).join('')}
                </div>
                
                <div class="receipt-totals">
                    <div class="receipt-line"></div>
                    <div class="total-line">
                        <span>SUBTOTAL:</span>
                        <span>R$ ${sale.subtotal.toFixed(2)}</span>
                    </div>
                    ${sale.discount > 0 ? `
                        <div class="total-line discount">
                            <span>DESCONTO (${sale.discountPercent}%):</span>
                            <span>-R$ ${sale.discount.toFixed(2)}</span>
                        </div>
                    ` : ''}
                    <div class="total-line final">
                        <span><strong>TOTAL:</strong></span>
                        <span><strong>R$ ${sale.total.toFixed(2)}</strong></span>
                    </div>
                </div>
                
                <div class="receipt-payment">
                    <div class="receipt-line"></div>
                    <div class="payment-header">PAGAMENTO:</div>
                    ${sale.paymentMethods.map(payment => `
                        <div class="payment-line">
                            <span>${payment.name}:</span>
                            <span>R$ ${payment.amount.toFixed(2)}</span>
                        </div>
                        ${payment.change > 0 ? `
                            <div class="payment-line change">
                                <span>Troco:</span>
                                <span>R$ ${payment.change.toFixed(2)}</span>
                            </div>
                        ` : ''}
                    `).join('')}
                </div>
                
                <div class="receipt-footer">
                    <div class="receipt-line"></div>
                    <div class="footer-text">Obrigado pela preferência!</div>
                    <div class="footer-text">Sistema desenvolvido por System Code</div>
                </div>
            </div>
        `;
    }

    closeReceiptModal() {
        document.getElementById('receiptModal').style.display = 'none';
    }

    printReceipt() {
        const receiptContent = document.getElementById('receiptContent').innerHTML;
        const printWindow = window.open('', '_blank');
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Recibo de Venda</title>
                <style>
                    body { font-family: monospace; margin: 20px; }
                    .receipt { max-width: 300px; margin: 0 auto; }
                    .receipt-header { text-align: center; margin-bottom: 20px; }
                    .receipt-header h2 { margin: 0; font-size: 18px; }
                    .receipt-title { font-weight: bold; margin: 10px 0; }
                    .receipt-line { border-top: 1px dashed #000; margin: 10px 0; }
                    .receipt-info { margin-bottom: 15px; }
                    .receipt-datetime { display: flex; justify-content: space-between; }
                    .items-header { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 5px; font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 5px; }
                    .receipt-item { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 5px; margin: 5px 0; }
                    .total-line { display: flex; justify-content: space-between; margin: 5px 0; }
                    .total-line.final { font-weight: bold; font-size: 16px; }
                    .payment-line { display: flex; justify-content: space-between; margin: 3px 0; }
                    .receipt-footer { text-align: center; margin-top: 20px; font-size: 12px; }
                    @media print {
                        body { margin: 0; }
                        .receipt { max-width: none; }
                    }
                </style>
            </head>
            <body>
                ${receiptContent}
            </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    }

    exitReportsInterface() {
    this.isActive = false;
    
    const reportsInterface = document.getElementById('reportsInterface');
    if (reportsInterface) {
        reportsInterface.style.display = 'none';
    }
    
    // CORREÇÃO: Forçar atualização da interface home
    const logo = document.querySelector('#vendedorContent .dashboard-logo');
    const productsList = document.getElementById('vendedorProductsList');
    const searchContainer = document.getElementById('vendedorSearchContainer');
    
    if (vendedorProducts && vendedorProducts.length > 0) {
        if (logo) logo.style.display = 'none';
        searchContainer.classList.add('show');
        productsList.classList.add('show');
        renderVendedorProducts();
    } else {
        if (logo) logo.style.display = 'block';
    }
    
    // Atualizar navegação
    document.querySelectorAll('#vendedorDashboard .nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-section') === 'home') {
            btn.classList.add('active');
        }
    });
}


    getPaymentMethodName(method) {
        const names = {
            'debito': 'Débito',
            'credito': 'Crédito',
            'pix': 'PIX',
            'dinheiro': 'Dinheiro',
            'voucher': 'Voucher'
        };
        return names[method] || method;
    }

    addReportsStyles() {
        if (document.getElementById('reportsSystemStyles')) return;
        
        const style = document.createElement('style');
        style.id = 'reportsSystemStyles';
        style.textContent =  `
            .reports-container {
                background: white;
                border-radius: 15px;
                padding: 30px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            }

            .reports-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 30px;
            }

            .reports-header h2 {
                font-size: 28px;
                color: #333;
                margin: 0;
            }

            .reports-filters {
                display: flex;
                gap: 10px;
                margin-bottom: 30px;
                justify-content: center;
            }

            .filter-btn {
                background: white;
                border: 2px solid #007bff;
                color: #007bff;
                padding: 10px 20px;
                border-radius: 25px;
                cursor: pointer;
                font-weight: bold;
                transition: all 0.3s ease;
            }

            .filter-btn:hover,
            .filter-btn.active {
                background: #007bff;
                color: white;
            }

            .reports-summary {
                margin-bottom: 30px;
            }

            .summary-card {
                background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                border-radius: 15px;
                padding: 25px;
                border-left: 5px solid #007bff;
            }

            .summary-period {
                font-size: 20px;
                font-weight: bold;
                color: #333;
                margin-bottom: 20px;
                text-align: center;
            }

            .summary-stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 20px;
                margin-bottom: 25px;
            }

            .stat-item {
                text-align: center;
                background: white;
                padding: 15px;
                border-radius: 10px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }

            .stat-label {
                font-size: 12px;
                color: #666;
                margin-bottom: 5px;
                text-transform: uppercase;
                font-weight: bold;
            }

            .stat-value {
                font-size: 24px;
                font-weight: bold;
                color: #007bff;
            }

            .payment-methods-summary h4 {
                margin: 0 0 15px 0;
                color: #333;
                font-size: 16px;
            }

            .payment-stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 10px;
            }

            .payment-stat {
                display: flex;
                justify-content: space-between;
                background: white;
                padding: 10px 15px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }

            .payment-method {
                font-weight: bold;
                color: #333;
            }

            .payment-amount {
                color: #28a745;
                font-weight: bold;
            }

            .reports-list {
                max-height: 600px;
                overflow-y: auto;
            }

            .sale-item {
                background: white;
                border-radius: 10px;
                padding: 20px;
                margin-bottom: 15px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                cursor: pointer;
                transition: all 0.3s ease;
                border-left: 4px solid #007bff;
            }

            .sale-item:hover {
                transform: translateX(5px);
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
            }

            .sale-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
            }

            .sale-date-time {
                display: flex;
                flex-direction: column;
                gap: 2px;
            }

            .sale-date {
                font-weight: bold;
                color: #333;
                font-size: 16px;
            }

            .sale-time {
                color: #666;
                font-size: 14px;
            }

            .sale-total {
                font-size: 20px;
                font-weight: bold;
                color: #28a745;
            }

            .sale-details {
                margin-bottom: 10px;
            }

            .sale-items {
                color: #666;
                margin-bottom: 5px;
                font-size: 14px;
            }

            .sale-payment {
                color: #007bff;
                font-weight: bold;
                font-size: 14px;
            }

            .sale-discount {
                background: #fff3cd;
                color: #856404;
                padding: 5px 10px;
                border-radius: 5px;
                font-size: 12px;
                font-weight: bold;
            }

            .no-sales {
                text-align: center;
                padding: 60px 20px;
                color: #666;
            }

            .no-sales-icon {
                font-size: 48px;
                margin-bottom: 20px;
            }

            .no-sales-text {
                font-size: 18px;
            }

            /* Modal do Recibo */
            .reports-modal {
                display: none;
                position: fixed;
                z-index: 2000;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
            }

            .reports-modal-content {
                background-color: white;
                margin: 2% auto;
                padding: 0;
                border-radius: 15px;
                width: 90%;
                max-width: 600px;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            }

            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px 30px;
                border-bottom: 1px solid #eee;
            }

            .modal-header h3 {
                margin: 0;
                color: #333;
            }

            .close-modal-btn {
                background: none;
                border: none;
                font-size: 24px;
                color: #666;
                cursor: pointer;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .close-modal-btn:hover {
                color: #333;
            }

            .receipt-content {
                padding: 30px;
            }

            /* Estilos do Recibo */
            .receipt {
                max-width: 400px;
                margin: 0 auto;
                font-family: monospace;
                line-height: 1.4;
            }

            .receipt-header {
                text-align: center;
                margin-bottom: 25px;
            }

            .receipt-header h2 {
                margin: 0;
                font-size: 24px;
                font-weight: bold;
                color: #333;
            }

            .receipt-title {
                font-weight: bold;
                margin: 10px 0;
                font-size: 16px;
            }

            .receipt-line {
                border-top: 2px dashed #ccc;
                margin: 15px 0;
            }

            .receipt-info {
                margin-bottom: 20px;
            }

            .receipt-datetime {
                display: flex;
                justify-content: space-between;
                margin-bottom: 5px;
            }

            .receipt-id {
                text-align: center;
                color: #666;
                font-size: 12px;
            }

            .items-header {
                display: grid;
                grid-template-columns: 2fr 1fr 1fr 1fr;
                gap: 10px;
                font-weight: bold;
                border-bottom: 1px solid #333;
                padding-bottom: 5px;
                margin-bottom: 10px;
                font-size: 12px;
            }

            .receipt-item {
                display: grid;
                grid-template-columns: 2fr 1fr 1fr 1fr;
                gap: 10px;
                margin: 5px 0;
                font-size: 12px;
            }

            .item-name {
                font-weight: bold;
            }

            .receipt-totals {
                margin: 20px 0;
            }

            .total-line {
                display: flex;
                justify-content: space-between;
                margin: 8px 0;
            }

            .total-line.discount {
                color: #dc3545;
            }

            .total-line.final {
                font-weight: bold;
                font-size: 16px;
                border-top: 1px solid #333;
                padding-top: 8px;
            }

            .receipt-payment {
                margin: 20px 0;
            }

            .payment-header {
                font-weight: bold;
                margin-bottom: 10px;
            }

            .payment-line {
                display: flex;
                justify-content: space-between;
                margin: 5px 0;
            }

            .payment-line.change {
                color: #007bff;
                font-weight: bold;
            }

            .receipt-footer {
                text-align: center;
                margin-top: 25px;
                color: #666;
            }

            .footer-text {
                margin: 5px 0;
                font-size: 12px;
            }

            .receipt-actions {
                padding: 20px 30px;
                border-top: 1px solid #eee;
                display: flex;
                gap: 15px;
                justify-content: center;
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
            }

            .print-btn {
                background: #007bff;
                color: white;
            }

            .print-btn:hover {
                background: #0056b3;
            }

            .close-btn {
                background: #6c757d;
                color: white;
            }

            .close-btn:hover {
                background: #5a6268;
            }

            @media (max-width: 768px) {
                .reports-modal-content {
                    margin: 5% auto;
                    width: 95%;
                }

                .summary-stats {
                    grid-template-columns: 1fr 1fr;
                }

                .payment-stats {
                    grid-template-columns: 1fr;
                }

                .sale-header {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 10px;
                }

                .items-header,
                .receipt-item {
                    grid-template-columns: 1fr;
                    gap: 5px;
                }

                .receipt-actions {
                    flex-direction: column;
                }
            }
        `;
    document.head.appendChild(style);
    }
}
// Instanciar globalmente
if (typeof window !== 'undefined') {
    window.reportsSystem = new SalesReportsSystem();
}
// Integração com o sistema de vendas existente
if (typeof window !== 'undefined') {
    window.reportsSystem = new SalesReportsSystem();
    
    // Sobrescrever a função confirmSale do sistema de vendas para integrar com relatórios
    if (window.salesSystem) {
        const originalConfirmSale = window.salesSystem.confirmSale;
        
        window.salesSystem.confirmSale = function() {
            const finalTotal = this.total - this.discount;
            
            if (Math.abs(finalTotal - this.totalPaid) > 0.01) {
                alert('O pagamento ainda não foi completado!');
                return;
            }
            
            // Processar estoque
            try {
                if (window.inventorySystem) {
                    window.inventorySystem.processSale(this.cart);
                }
            } catch (error) {
                console.error('Erro ao processar estoque:', error);
                alert('Erro ao atualizar estoque: ' + error.message);
                return;
            }
            
            // Preparar dados da venda para o relatório
            const saleData = {
                items: [...this.cart],
                subtotal: this.total,
                discount: this.discount,
                discountPercent: this.discount > 0 ? ((this.discount / this.total) * 100).toFixed(1) : 0,
                total: finalTotal,
                paymentMethods: [...this.paymentMethods],
                totalPaid: this.totalPaid
            };
            
            // Registrar venda no sistema de relatórios
            if (window.reportsSystem) {
                window.reportsSystem.registerSale(saleData);
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
        };
    }
}