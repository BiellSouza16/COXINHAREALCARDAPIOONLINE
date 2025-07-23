// Estado global da aplicação
let orderState = {
    salgados: {},
    combos: {},
    bebidas: {},
    cliente: {
        nome: '',
        data: '',
        horario: ''
    },
    total: 0
};

// Mapeamento de nomes dos sabores
const saborNames = {
    'coxinha': 'Coxinha',
    'palitinho': 'Palitinho',
    'balaozinho': 'Balãozinho',
    'travesseirinho': 'Travesseirinho',
    'kibe-queijo': 'Kibe de Queijo',
    'kibe-carne': 'Kibe de Carne',
    'churros-doce': 'Churros de Doce de Leite',
    'churros-chocolate': 'Churros de Chocolate',
    'enroladinho': 'Enroladinho de Salsicha',
    'boliviano': 'Boliviano'
};

// Mapeamento de nomes dos refrigerantes
const refriNames = {
    'pepsi-200': 'Pepsi 200ml',
    'guarana-200': 'Guaraná 200ml',
    'pepsi-1l': 'Pepsi 1L',
    'guarana-1l': 'Guaraná 1L',
    'it-cola-2l': 'It Cola 2L',
    'it-guarana-2l': 'It Guaraná 2L'
};

// Configurações dos combos
const comboConfigs = {
    'combo-a-dois': {
        name: 'Combo A Dois',
        units: 25,
        refriCount: { sem: 0, com: 2 }
    },
    'combo-grupinho': {
        name: 'Combo Grupinho',
        units: 50,
        refriCount: { sem: 0, com: 1 }
    },
    'combo-galera': {
        name: 'Combo Galera',
        units: 100,
        refriCount: { sem: 0, com: 1 }
    }
};

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeSalgados();
    initializeCombos();
    initializeBebidas();
    initializeFinalizacao();
    initializeModal();
    initializeBackToTop();
    
    // Definir data de hoje como padrão
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('data-retirada').value = today;
    
    // Definir horário atual + 1 hora como padrão
    const now = new Date();
    now.setHours(now.getHours() + 1);
    const timeString = now.getHours().toString().padStart(2, '0') + ':' + 
                     now.getMinutes().toString().padStart(2, '0');
    document.getElementById('horario-retirada').value = timeString;
});

// Navegação entre seções
function initializeNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.section');
    
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const sectionId = this.getAttribute('data-section');
            
            // Atualizar botões ativos
            navButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Mostrar seção correspondente
            sections.forEach(section => section.classList.remove('active'));
            document.getElementById(sectionId).classList.add('active');
            
            // Scroll para o topo
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
}

// Inicializar salgados
function initializeSalgados() {
    const salgadoCards = document.querySelectorAll('#salgados .item-card');
    
    salgadoCards.forEach(card => {
        const itemName = card.getAttribute('data-item');
        const price = parseFloat(card.getAttribute('data-price'));
        const qtyInput = card.querySelector('.qty-input');
        const minusBtn = card.querySelector('.minus');
        const plusBtn = card.querySelector('.plus');
        const totalElement = card.querySelector('.item-total');
        
        // Inicializar estado
        orderState.salgados[itemName] = { quantity: 0, price: price };
        
        // Event listeners para botões
        minusBtn.addEventListener('click', () => {
            let currentQty = parseInt(qtyInput.value) || 0;
            if (currentQty > 0) {
                currentQty--;
                qtyInput.value = currentQty;
                updateSalgadoItem(itemName, currentQty, price, totalElement, card);
            }
        });
        
        plusBtn.addEventListener('click', () => {
            let currentQty = parseInt(qtyInput.value) || 0;
            currentQty++;
            qtyInput.value = currentQty;
            updateSalgadoItem(itemName, currentQty, price, totalElement, card);
        });
        
        // Event listener para input direto
        qtyInput.addEventListener('input', () => {
            let currentQty = parseInt(qtyInput.value) || 0;
            if (currentQty < 0) {
                currentQty = 0;
                qtyInput.value = 0;
            }
            updateSalgadoItem(itemName, currentQty, price, totalElement, card);
        });
    });
}

function updateSalgadoItem(itemName, quantity, price, totalElement, card) {
    orderState.salgados[itemName].quantity = quantity;
    const total = quantity * price;
    totalElement.textContent = `Total: R$ ${total.toFixed(2).replace('.', ',')}`;
    
    // Adicionar classe visual se tem quantidade
    if (quantity > 0) {
        card.classList.add('has-quantity');
    } else {
        card.classList.remove('has-quantity');
    }
    
    updateGrandTotal();
    updateOrderSummary();
}

// Inicializar combos
function initializeCombos() {
    const comboCards = document.querySelectorAll('.combo-card');
    
    comboCards.forEach(card => {
        const comboName = card.getAttribute('data-combo');
        const config = comboConfigs[comboName];
        
        // Inicializar estado do combo
        orderState.combos[comboName] = {
            quantity: 0,
            priceOption: null,
            price: 0,
            sabores: {},
            refrigerantes: {}
        };
        
        initializeComboCard(card, comboName, config);
    });
}

function initializeComboCard(card, comboName, config) {
    const qtyInput = card.querySelector('.combo-qty-input');
    const minusBtn = card.querySelector('.minus');
    const plusBtn = card.querySelector('.plus');
    const priceRadios = card.querySelectorAll('input[type="radio"]');
    const saboresSection = card.querySelector('.sabores-selection');
    const refriSection = card.querySelector('.refri-selection');
    const totalElement = card.querySelector('.combo-total');
    
    // Event listeners para quantidade
    minusBtn.addEventListener('click', () => {
        let currentQty = parseInt(qtyInput.value) || 0;
        if (currentQty > 0) {
            currentQty--;
            qtyInput.value = currentQty;
            updateComboQuantity(comboName, currentQty, card, config);
        }
    });
    
    plusBtn.addEventListener('click', () => {
        let currentQty = parseInt(qtyInput.value) || 0;
        currentQty++;
        qtyInput.value = currentQty;
        updateComboQuantity(comboName, currentQty, card, config);
    });
    
    qtyInput.addEventListener('input', () => {
        let currentQty = parseInt(qtyInput.value) || 0;
        if (currentQty < 0) {
            currentQty = 0;
            qtyInput.value = 0;
        }
        updateComboQuantity(comboName, currentQty, card, config);
    });
    
    // Event listeners para preços
    priceRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.checked) {
                const price = parseFloat(radio.value);
                const withRefri = radio.id.includes('-com');
                orderState.combos[comboName].priceOption = radio.value;
                orderState.combos[comboName].price = price;
                orderState.combos[comboName].withRefri = withRefri;
                
                // Mostrar/esconder seção de refrigerantes
                if (withRefri) {
                    refriSection.style.display = 'block';
                } else {
                    refriSection.style.display = 'none';
                    // Limpar refrigerantes selecionados
                    orderState.combos[comboName].refrigerantes = {};
                    const refriInputs = refriSection.querySelectorAll('.refri-qty');
                    refriInputs.forEach(input => input.value = 0);
                }
                
                updateComboTotal(comboName, totalElement);
                updateComboRefriCounter(comboName, refriSection, config);
                updateGrandTotal();
                updateOrderSummary();
            }
        });
    });
    
    // Inicializar sabores
    initializeComboSabores(card, comboName, config);
    
    // Inicializar refrigerantes
    initializeComboRefrigerantes(card, comboName, config);
}

function initializeComboSabores(card, comboName, config) {
    const saborInputs = card.querySelectorAll('.sabor-qty');
    
    saborInputs.forEach(input => {
        const saborName = input.getAttribute('data-sabor');
        orderState.combos[comboName].sabores[saborName] = 0;
        
        input.addEventListener('input', () => {
            let quantity = parseInt(input.value) || 0;
            if (quantity < 0) {
                quantity = 0;
                input.value = 0;
            }
            
            orderState.combos[comboName].sabores[saborName] = quantity;
            updateComboSaboresCounter(comboName, card, config);
        });
    });
}

function initializeComboRefrigerantes(card, comboName, config) {
    const refriInputs = card.querySelectorAll('.refri-qty');
    
    refriInputs.forEach(input => {
        const refriName = input.getAttribute('data-refri');
        orderState.combos[comboName].refrigerantes[refriName] = 0;
        
        input.addEventListener('input', () => {
            let quantity = parseInt(input.value) || 0;
            if (quantity < 0) {
                quantity = 0;
                input.value = 0;
            }
            
            orderState.combos[comboName].refrigerantes[refriName] = quantity;
            updateComboRefriCounter(comboName, card.querySelector('.refri-selection'), config);
        });
    });
}

function updateComboQuantity(comboName, quantity, card, config) {
    orderState.combos[comboName].quantity = quantity;
    
    const saboresSection = card.querySelector('.sabores-selection');
    const totalElement = card.querySelector('.combo-total');
    
    if (quantity > 0) {
        saboresSection.style.display = 'block';
        card.classList.add('has-selection');
    } else {
        saboresSection.style.display = 'none';
        card.classList.remove('has-selection');
        // Limpar sabores e refrigerantes
        orderState.combos[comboName].sabores = {};
        orderState.combos[comboName].refrigerantes = {};
        const saborInputs = saboresSection.querySelectorAll('.sabor-qty');
        saborInputs.forEach(input => {
            input.value = 0;
            orderState.combos[comboName].sabores[input.getAttribute('data-sabor')] = 0;
        });
    }
    
    updateComboSaboresCounter(comboName, card, config);
    updateComboTotal(comboName, totalElement);
    updateGrandTotal();
    updateOrderSummary();
}

function updateComboSaboresCounter(comboName, card, config) {
    const combo = orderState.combos[comboName];
    const totalSabores = Object.values(combo.sabores).reduce((sum, qty) => sum + qty, 0);
    const totalNeeded = combo.quantity * config.units;
    
    const counter = card.querySelector('.sabores-counter');
    const selectedSpan = counter.querySelector('.selected-count');
    const totalSpan = counter.querySelector('.total-needed');
    
    selectedSpan.textContent = totalSabores;
    totalSpan.textContent = totalNeeded;
    
    // Destacar se não está correto
    if (combo.quantity > 0 && totalSabores !== totalNeeded) {
        counter.style.color = '#DC143C';
        counter.style.fontWeight = 'bold';
    } else {
        counter.style.color = '#000';
        counter.style.fontWeight = 'bold';
    }
}

function updateComboRefriCounter(comboName, refriSection, config) {
    const combo = orderState.combos[comboName];
    const totalRefri = Object.values(combo.refrigerantes).reduce((sum, qty) => sum + qty, 0);
    const totalNeeded = combo.withRefri ? combo.quantity * config.refriCount.com : 0;
    
    const counter = refriSection.querySelector('.refri-counter');
    if (counter) {
        const selectedSpan = counter.querySelector('.refri-selected-count');
        const totalSpan = counter.querySelector('.refri-total-needed');
        
        selectedSpan.textContent = totalRefri;
        totalSpan.textContent = totalNeeded;
        
        // Destacar se não está correto
        if (combo.withRefri && totalRefri !== totalNeeded) {
            counter.style.color = '#DC143C';
            counter.style.fontWeight = 'bold';
        } else {
            counter.style.color = '#000';
            counter.style.fontWeight = 'bold';
        }
    }
}

function updateComboTotal(comboName, totalElement) {
    const combo = orderState.combos[comboName];
    const total = combo.quantity * combo.price;
    totalElement.textContent = `Total: R$ ${total.toFixed(2).replace('.', ',')}`;
}

// Inicializar bebidas
function initializeBebidas() {
    const bebidaCards = document.querySelectorAll('#bebidas .item-card');
    
    bebidaCards.forEach(card => {
        const itemName = card.getAttribute('data-item');
        const price = parseFloat(card.getAttribute('data-price'));
        const qtyInput = card.querySelector('.qty-input');
        const minusBtn = card.querySelector('.minus');
        const plusBtn = card.querySelector('.plus');
        const totalElement = card.querySelector('.item-total');
        
        // Inicializar estado
        orderState.bebidas[itemName] = { quantity: 0, price: price };
        
        // Event listeners para botões
        minusBtn.addEventListener('click', () => {
            let currentQty = parseInt(qtyInput.value) || 0;
            if (currentQty > 0) {
                currentQty--;
                qtyInput.value = currentQty;
                updateBebidaItem(itemName, currentQty, price, totalElement, card);
            }
        });
        
        plusBtn.addEventListener('click', () => {
            let currentQty = parseInt(qtyInput.value) || 0;
            currentQty++;
            qtyInput.value = currentQty;
            updateBebidaItem(itemName, currentQty, price, totalElement, card);
        });
        
        // Event listener para input direto
        qtyInput.addEventListener('input', () => {
            let currentQty = parseInt(qtyInput.value) || 0;
            if (currentQty < 0) {
                currentQty = 0;
                qtyInput.value = 0;
            }
            updateBebidaItem(itemName, currentQty, price, totalElement, card);
        });
    });
}

function updateBebidaItem(itemName, quantity, price, totalElement, card) {
    orderState.bebidas[itemName].quantity = quantity;
    const total = quantity * price;
    totalElement.textContent = `Total: R$ ${total.toFixed(2).replace('.', ',')}`;
    
    // Adicionar classe visual se tem quantidade
    if (quantity > 0) {
        card.classList.add('has-quantity');
    } else {
        card.classList.remove('has-quantity');
    }
    
    updateGrandTotal();
    updateOrderSummary();
}

// Atualizar total geral
function updateGrandTotal() {
    let total = 0;
    
    // Somar salgados
    Object.values(orderState.salgados).forEach(item => {
        total += item.quantity * item.price;
    });
    
    // Somar combos
    Object.values(orderState.combos).forEach(combo => {
        total += combo.quantity * combo.price;
    });
    
    // Somar bebidas
    Object.values(orderState.bebidas).forEach(item => {
        total += item.quantity * item.price;
    });
    
    orderState.total = total;
    
    const totalElement = document.getElementById('grand-total-value');
    if (totalElement) {
        totalElement.textContent = total.toFixed(2).replace('.', ',');
    }
    
    // Habilitar/desabilitar botão de finalizar
    const finalizarBtn = document.getElementById('finalizar-pedido-btn');
    if (finalizarBtn) {
        finalizarBtn.disabled = total === 0;
    }
}

// Atualizar resumo do pedido
function updateOrderSummary() {
    const summaryContent = document.getElementById('order-summary-content');
    if (!summaryContent) return;
    
    let html = '';
    let hasItems = false;
    
    // Salgados
    const salgadosWithQty = Object.entries(orderState.salgados).filter(([_, item]) => item.quantity > 0);
    if (salgadosWithQty.length > 0) {
        hasItems = true;
        html += '<div class="summary-section"><h4>🍗 Salgados de R$1,00:</h4><ul>';
        salgadosWithQty.forEach(([name, item]) => {
            const displayName = saborNames[name] || name;
            const total = item.quantity * item.price;
            html += `<li>${item.quantity}x ${displayName} - R$ ${total.toFixed(2).replace('.', ',')}</li>`;
        });
        html += '</ul></div>';
    }
    
    // Combos
    const combosWithQty = Object.entries(orderState.combos).filter(([_, combo]) => combo.quantity > 0);
    if (combosWithQty.length > 0) {
        hasItems = true;
        html += '<div class="summary-section"><h4>🍱 Combos:</h4>';
        combosWithQty.forEach(([name, combo]) => {
            const config = comboConfigs[name];
            const total = combo.quantity * combo.price;
            const comboTypeText = combo.withRefri ? 'com refrigerante' : 'sem refrigerante';
            html += `<div class="combo-summary">`;
            html += `<p><strong>${combo.quantity}x ${config.name} (${comboTypeText}) - R$ ${total.toFixed(2).replace('.', ',')}</strong></p>`;
            
            // Sabores do combo
            const saboresWithQty = Object.entries(combo.sabores).filter(([_, qty]) => qty > 0);
            if (saboresWithQty.length > 0) {
                html += '<ul class="sabores-list">';
                saboresWithQty.forEach(([saborName, qty]) => {
                    const displayName = saborNames[saborName] || saborName;
                    html += `<li>${qty} ${displayName}</li>`;
                });
                html += '</ul>';
            }
            
            // Refrigerantes do combo
            if (combo.withRefri) {
                const refrisWithQty = Object.entries(combo.refrigerantes).filter(([_, qty]) => qty > 0);
                if (refrisWithQty.length > 0) {
                    html += '<ul class="refris-list">';
                    refrisWithQty.forEach(([refriName, qty]) => {
                        const displayName = refriNames[refriName] || refriName;
                        html += `<li>${qty} ${displayName}</li>`;
                    });
                    html += '</ul>';
                }
            }
            html += '</div>';
        });
        html += '</div>';
    }
    
    // Bebidas
    const bebidasWithQty = Object.entries(orderState.bebidas).filter(([_, item]) => item.quantity > 0);
    if (bebidasWithQty.length > 0) {
        hasItems = true;
        html += '<div class="summary-section"><h4>🥤 Bebidas Avulsas:</h4><ul>';
        bebidasWithQty.forEach(([name, item]) => {
            const total = item.quantity * item.price;
            // Converter nome da bebida para display
            let displayName = name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            html += `<li>${item.quantity}x ${displayName} - R$ ${total.toFixed(2).replace('.', ',')}</li>`;
        });
        html += '</ul></div>';
    }
    
    if (!hasItems) {
        html = '<p class="empty-order">Adicione itens ao seu pedido para ver o resumo aqui.</p>';
    } else {
        html += `<div class="summary-total"><strong>Total Geral: R$ ${orderState.total.toFixed(2).replace('.', ',')}</strong></div>`;
    }
    
    summaryContent.innerHTML = html;
}

// Inicializar finalização
function initializeFinalizacao() {
    const nomeInput = document.getElementById('cliente-nome');
    const dataInput = document.getElementById('data-retirada');
    const horarioInput = document.getElementById('horario-retirada');
    const finalizarBtn = document.getElementById('finalizar-pedido-btn');
    
    // Event listeners para campos obrigatórios
    [nomeInput, dataInput, horarioInput].forEach(input => {
        input.addEventListener('input', () => {
            orderState.cliente[input.id.replace('cliente-', '').replace('-retirada', '')] = input.value;
            validateFinalizacao();
        });
    });
    
    // Event listener para botão finalizar
    finalizarBtn.addEventListener('click', () => {
        if (validateOrder()) {
            showOrderModal();
        }
    });
}

function validateFinalizacao() {
    const nome = document.getElementById('cliente-nome').value.trim();
    const data = document.getElementById('data-retirada').value;
    const horario = document.getElementById('horario-retirada').value;
    const finalizarBtn = document.getElementById('finalizar-pedido-btn');
    
    const isValid = nome && data && horario && orderState.total > 0;
    finalizarBtn.disabled = !isValid;
}

// Validar pedido completo
function validateOrder() {
    const errors = [];
    
    // Validar dados do cliente
    const nome = document.getElementById('cliente-nome').value.trim();
    const data = document.getElementById('data-retirada').value;
    const horario = document.getElementById('horario-retirada').value;
    
    if (!nome) errors.push('⚠️ Informe seu nome antes de finalizar o pedido');
    if (!data) errors.push('⚠️ Selecione a data de retirada');
    if (!horario) errors.push('⚠️ Selecione o horário de retirada');
    
    // Validar combos
    Object.entries(orderState.combos).forEach(([comboName, combo]) => {
        if (combo.quantity > 0) {
            const config = comboConfigs[comboName];
            
            // Validar seleção de preço
            if (!combo.priceOption) {
                errors.push(`⚠️ Selecione se quer ${config.name} com ou sem refrigerante`);
                return;
            }
            
            // Validar sabores
            const totalSabores = Object.values(combo.sabores).reduce((sum, qty) => sum + qty, 0);
            const expectedSabores = combo.quantity * config.units;
            
            if (totalSabores !== expectedSabores) {
                if (combo.quantity === 1) {
                    errors.push(`⚠️ Falta selecionar os sabores dos salgados do ${config.name}`);
                } else {
                    errors.push(`⚠️ Falta selecionar os sabores dos salgados do ${config.name} (${combo.quantity} unidades)`);
                }
            }
            
            // Validar refrigerantes se necessário
            if (combo.withRefri) {
                const totalRefris = Object.values(combo.refrigerantes).reduce((sum, qty) => sum + qty, 0);
                const expectedRefris = combo.quantity * config.refriCount.com;
                
                if (totalRefris !== expectedRefris) {
                    if (combo.quantity === 1) {
                        errors.push(`⚠️ Selecione os refrigerantes obrigatórios do ${config.name}`);
                    } else {
                        errors.push(`⚠️ Selecione os refrigerantes obrigatórios do ${config.name} (${combo.quantity} unidades)`);
                    }
                }
            }
        }
    });
    
    // Mostrar erros se houver
    if (errors.length > 0) {
        showErrorMessages(errors);
        return false;
    }
    
    return true;
}

function showErrorMessages(errors) {
    const errorContainer = document.getElementById('error-messages');
    errorContainer.innerHTML = '';
    
    errors.forEach(error => {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = error;
        errorContainer.appendChild(errorDiv);
        
        // Remover após 5 segundos
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    });
}

// Modal
function initializeModal() {
    const modal = document.getElementById('resumo-modal');
    const closeBtn = modal.querySelector('.close');
    const cancelBtn = document.getElementById('fechar-modal');
    const whatsappBtn = document.getElementById('enviar-whatsapp');
    
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    cancelBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    whatsappBtn.addEventListener('click', () => {
        sendToWhatsApp();
    });
    
    // Fechar modal clicando fora
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

function showOrderModal() {
    const modal = document.getElementById('resumo-modal');
    const resumoContent = document.getElementById('resumo-pedido');
    
    const resumoText = generateOrderSummary();
    resumoContent.innerHTML = `<pre style="white-space: pre-wrap; font-family: inherit;">${resumoText}</pre>`;
    
    modal.style.display = 'block';
}

function generateOrderSummary() {
    const nome = document.getElementById('cliente-nome').value.trim();
    const data = document.getElementById('data-retirada').value;
    const horario = document.getElementById('horario-retirada').value;
    
    // Formatear data
    const dataObj = new Date(data + 'T00:00:00');
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    let dataText;
    if (dataObj.getTime() === hoje.getTime()) {
        dataText = 'hoje';
    } else {
        dataText = dataObj.toLocaleDateString('pt-BR');
    }
    
    let resumo = `👤Resumo do pedido de: ${nome}\n\n`;
    
    // Combos
    Object.entries(orderState.combos).forEach(([comboName, combo]) => {
        if (combo.quantity > 0) {
            const config = comboConfigs[comboName];
            const comboTypeText = combo.withRefri ? 'Com refri' : 'Sem refri';
            const total = combo.quantity * combo.price;
            
            if (combo.quantity === 1) {
                resumo += `🍱${config.name} - ${comboTypeText} - R$${total.toFixed(2)}\n`;
            } else {
                resumo += `🍱${combo.quantity}x ${config.name} - ${comboTypeText} - R$${total.toFixed(2)}\n`;
            }
            
            // Sabores
            Object.entries(combo.sabores).forEach(([saborName, qty]) => {
                if (qty > 0) {
                    const displayName = saborNames[saborName] || saborName;
                    resumo += `  • ${qty} ${displayName}\n`;
                }
            });
            
            // Refrigerantes
            if (combo.withRefri) {
                Object.entries(combo.refrigerantes).forEach(([refriName, qty]) => {
                    if (qty > 0) {
                        const displayName = refriNames[refriName] || refriName;
                        resumo += `  • ${qty} ${displayName}\n`;
                    }
                });
            }
            
            resumo += '\n';
        }
    });
    
    // Salgados avulsos
    const salgadosWithQty = Object.entries(orderState.salgados).filter(([_, item]) => item.quantity > 0);
    if (salgadosWithQty.length > 0) {
        resumo += '🍗Salgados avulsos:\n';
        salgadosWithQty.forEach(([name, item]) => {
            const displayName = saborNames[name] || name;
            const total = item.quantity * item.price;
            resumo += `  • ${item.quantity}x ${displayName} - R$${total.toFixed(2)}\n`;
        });
        resumo += '\n';
    }
    
    // Bebidas avulsas
    const bebidasWithQty = Object.entries(orderState.bebidas).filter(([_, item]) => item.quantity > 0);
    if (bebidasWithQty.length > 0) {
        resumo += '🥤Bebidas avulsas:\n';
        bebidasWithQty.forEach(([name, item]) => {
            let displayName = name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            const total = item.quantity * item.price;
            resumo += `  • ${item.quantity}x ${displayName} - R$${total.toFixed(2)}\n`;
        });
        resumo += '\n';
    }
    
    resumo += `📅 _Para ${dataText} às ${horario}_\n\n`;
    resumo += `Valor Total = *💰R$${orderState.total.toFixed(2)}💰*\n\n`;
    resumo += '*📌RETIRADA NA LOJA 01 AO LADO DO BUDEGÃO SUPERMERCADO*';
    
    return resumo;
}

function sendToWhatsApp() {
    const resumoText = generateOrderSummary();
    const encodedText = encodeURIComponent(resumoText);
    
    // Número do WhatsApp (substitua pelo número real da lanchonete)
    const phoneNumber = '5573981741968'; // Formato: código do país + código da área + número
    
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedText}`;
    
    // Abrir WhatsApp
    window.open(whatsappURL, '_blank');
    
    // Fechar modal
    document.getElementById('resumo-modal').style.display = 'none';
}

// Botão voltar ao topo
function initializeBackToTop() {
    const backToTopBtn = document.getElementById('back-to-top');
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopBtn.style.display = 'block';
        } else {
            backToTopBtn.style.display = 'none';
        }
    });
    
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}
