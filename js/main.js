/* ============================================
   PESTE DO RATO - JAVASCRIPT PRINCIPAL
   
   Este arquivo contém toda a lógica do site.
   Cada função está comentada explicando o que faz.
   
   ESTRUTURA:
   1. Configurações globais
   2. Splash Screen
   3. Tela de Boas-vindas
   4. Tema Dark/Light
   5. Menu Hamburger
   6. Carrossel
   7. Scroll Button
   8. Paginação
   9. Inicialização
   ============================================ */

// ============================================
// 1. CONFIGURAÇÕES GLOBAIS
// Modifique estes valores para ajustar comportamentos
// ============================================

const CONFIG = {
    // Tempo que a splash screen fica visível (em milissegundos)
    // EXEMPLO: 2000 = 2 segundos, 3000 = 3 segundos
    splashDuration: 2500,
    
    // Tempo que a tela de boas-vindas fica visível (em milissegundos)
    // 2500ms = 2.5 segundos (animação mais rápida conforme solicitado)
    welcomeDuration: 2500,
    
    // Velocidade do auto-scroll do carrossel (em milissegundos)
    // Quanto MAIOR o número, mais LENTO o carrossel passa
    carouselSpeed: 4000,
    
    // Quantidade de itens por página na listagem
    // EXEMPLO: 10 = mostra 10 cards por página
    itemsPerPage: 10,
    
    // Chave para salvar preferência de tema no navegador
    themeStorageKey: 'pesteDoRato_theme',
    
    // Chave para saber se já mostrou boas-vindas
    welcomeStorageKey: 'pesteDoRato_welcomeShown',
    
    // Tempo em milissegundos para mostrar novamente após última visita
    // 3600000 = 1 hora, 7200000 = 2 horas
    // Se usar 0, usa apenas sessionStorage (aparece a cada nova sessão)
    welcomeCooldown: 3600000, // 1 hora
    
    // Modo de controle da tela de boas-vindas:
    // 'session' = aparece uma vez por sessão (fecha navegador e abre = aparece)
    // 'time' = aparece uma vez a cada X tempo (definido em welcomeCooldown)
    welcomeMode: 'session'
};

// ============================================
// 2. SPLASH SCREEN
// Tela de carregamento com logo e animação
// ============================================

/**
 * Controla a exibição da splash screen
 * COMO MODIFICAR:
 * - Para mudar o tempo: altere CONFIG.splashDuration
 * - Para desativar: comente a chamada initSplashScreen() na função init()
 */
function initSplashScreen() {
    const splashScreen = document.getElementById('splash-screen');
    
    if (!splashScreen) return;
    
    // Após o tempo definido, esconde a splash screen
    setTimeout(() => {
        splashScreen.classList.add('hide');
        
        // Após a animação de fade, verifica se deve mostrar boas-vindas
        setTimeout(() => {
            checkWelcomeScreen();
        }, 800); // 800ms = tempo da animação de fade
    }, CONFIG.splashDuration);
}

// ============================================
// 3. TELA DE BOAS-VINDAS
// Aparece apenas na primeira visita
// ============================================

/**
 * Verifica se deve mostrar a tela de boas-vindas
 * 
 * MODOS DE FUNCIONAMENTO (configurar em CONFIG.welcomeMode):
 * 
 * 'session' - Aparece uma vez por sessão do navegador
 *   - Navegando pelo site: NÃO aparece novamente
 *   - Fechou o navegador e abriu: APARECE
 * 
 * 'time' - Aparece uma vez a cada X tempo (CONFIG.welcomeCooldown)
 *   - Exemplo: cooldown de 1 hora = só aparece novamente após 1 hora
 * 
 * COMO RESETAR (para mostrar novamente):
 * Abra o console do navegador (F12) e digite: resetWelcome()
 */
function checkWelcomeScreen() {
    const welcomeScreen = document.getElementById('welcome-screen');
    
    if (!welcomeScreen) return;
    
    let shouldShow = false;
    
    if (CONFIG.welcomeMode === 'session') {
        // Modo sessão: usa sessionStorage (limpa quando fecha o navegador)
        const alreadyShownThisSession = sessionStorage.getItem(CONFIG.welcomeStorageKey);
        shouldShow = !alreadyShownThisSession;
    } else if (CONFIG.welcomeMode === 'time') {
        // Modo tempo: verifica se passou o tempo de cooldown
        const lastShown = localStorage.getItem(CONFIG.welcomeStorageKey + '_time');
        
        if (!lastShown) {
            shouldShow = true;
        } else {
            const timePassed = Date.now() - parseInt(lastShown);
            shouldShow = timePassed >= CONFIG.welcomeCooldown;
        }
    }
    
    if (shouldShow) {
        showWelcomeScreen();
    }
}

/**
 * Mostra a tela de boas-vindas com animação
 */
function showWelcomeScreen() {
    const welcomeScreen = document.getElementById('welcome-screen');
    
    if (!welcomeScreen) return;
    
    // Mostra a tela
    welcomeScreen.classList.add('show');
    
    // Marca como já mostrado (dependendo do modo)
    if (CONFIG.welcomeMode === 'session') {
        sessionStorage.setItem(CONFIG.welcomeStorageKey, 'true');
    } else if (CONFIG.welcomeMode === 'time') {
        localStorage.setItem(CONFIG.welcomeStorageKey + '_time', Date.now().toString());
    }
    
    // Após o tempo definido, esconde
    setTimeout(() => {
        welcomeScreen.classList.remove('show');
        welcomeScreen.classList.add('hide');
    }, CONFIG.welcomeDuration);
}

/**
 * Função para resetar a tela de boas-vindas (útil para testes)
 * Chame esta função no console: resetWelcome()
 */
function resetWelcome() {
    sessionStorage.removeItem(CONFIG.welcomeStorageKey);
    localStorage.removeItem(CONFIG.welcomeStorageKey + '_time');
    console.log('Tela de boas-vindas resetada! Recarregue a página.');
}

// Disponibiliza a função globalmente para uso no console
window.resetWelcome = resetWelcome;

// ============================================
// 4. TEMA DARK/LIGHT
// Alterna entre modo escuro e claro
// ============================================

/**
 * Inicializa o sistema de temas
 * O tema é salvo no navegador e permanece ao recarregar
 */
function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    
    // Carrega tema salvo (ou usa 'dark' como padrão)
    const savedTheme = localStorage.getItem(CONFIG.themeStorageKey) || 'dark';
    
    // Aplica o tema salvo
    if (savedTheme === 'light') {
        body.classList.add('light-mode');
        updateThemeIcon(true);
        updateLogo(true);
    }
    
    // Adiciona evento de clique no botão
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}

/**
 * Alterna entre tema escuro e claro
 */
function toggleTheme() {
    const body = document.body;
    const isLight = body.classList.toggle('light-mode');
    
    // Salva preferência
    localStorage.setItem(CONFIG.themeStorageKey, isLight ? 'light' : 'dark');
    
    // Atualiza ícone e logo
    updateThemeIcon(isLight);
    updateLogo(isLight);
}

/**
 * Atualiza o aria-label do botão de tema
 * Os ícones SVG (sol/lua) são controlados via CSS automaticamente
 * @param {boolean} isLight - Se está no modo claro
 */
function updateThemeIcon(isLight) {
    const themeToggle = document.getElementById('theme-toggle');
    
    if (!themeToggle) return;
    
    // Apenas atualiza o aria-label para acessibilidade
    // Os ícones (sol/lua) são controlados pelo CSS através da classe light-mode
    themeToggle.setAttribute('aria-label', isLight ? 'Mudar para modo escuro' : 'Mudar para modo claro');
}

/**
 * Atualiza a logo baseado no tema
 * Logo branca para fundo escuro, logo preta para fundo claro
 * @param {boolean} isLight - Se está no modo claro
 */
function updateLogo(isLight) {
    const logos = document.querySelectorAll('.logo-img');
    
    logos.forEach(logo => {
        if (isLight) {
            logo.src = '/images/logopestedoratopreta.png';
            logo.alt = 'Peste do Rato - Logo Preta';
        } else {
            logo.src = '/images/logopestedoratobranca.png';
            logo.alt = 'Peste do Rato - Logo Branca';
        }
    });
}

// ============================================
// 5. MENU HAMBURGER
// Menu lateral para mobile
// ============================================

/**
 * Inicializa o menu hamburger
 */
function initHamburgerMenu() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const menuOverlay = document.getElementById('menu-overlay');
    
    if (!hamburger || !navMenu) return;
    
    // Clique no hamburger
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        if (menuOverlay) menuOverlay.classList.toggle('active');
        
        // Previne scroll do body quando menu está aberto
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });
    
    // Clique no overlay fecha o menu
    if (menuOverlay) {
        menuOverlay.addEventListener('click', closeMenu);
    }
    
    // Clique em links fecha o menu
    const menuLinks = navMenu.querySelectorAll('a');
    menuLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });
}

/**
 * Fecha o menu hamburger
 */
function closeMenu() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const menuOverlay = document.getElementById('menu-overlay');
    
    hamburger?.classList.remove('active');
    navMenu?.classList.remove('active');
    menuOverlay?.classList.remove('active');
    document.body.style.overflow = '';
}

// ============================================
// 6. CARROSSEL
// Slider horizontal com auto-scroll
// ============================================

/**
 * Inicializa todos os carrosséis da página
 * 
 * COMO MODIFICAR A VELOCIDADE:
 * Altere CONFIG.carouselSpeed (em milissegundos)
 * Exemplo: 3000 = 3 segundos entre cada movimento
 */
function initCarousels() {
    const carousels = document.querySelectorAll('.carousel-container');
    
    carousels.forEach(container => {
        const carousel = container.querySelector('.carousel');
        const prevBtn = container.querySelector('.carousel-btn.prev');
        const nextBtn = container.querySelector('.carousel-btn.next');
        
        if (!carousel) return;
        
        let currentIndex = 0;
        let autoScrollInterval;
        
        // Calcula a largura de cada item
        const getItemWidth = () => {
            const firstItem = carousel.children[0];
            if (!firstItem) return 300; // Valor padrão
            return firstItem.offsetWidth + 20; // 20 = gap
        };
        
        // Move para um índice específico
        const scrollToIndex = (index) => {
            const itemWidth = getItemWidth();
            const maxIndex = carousel.children.length - Math.floor(container.offsetWidth / itemWidth);
            
            // Limita o índice
            currentIndex = Math.max(0, Math.min(index, maxIndex));
            
            carousel.style.transform = `translateX(-${currentIndex * itemWidth}px)`;
        };
        
        // Botão anterior
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                scrollToIndex(currentIndex - 1);
                resetAutoScroll();
            });
        }
        
        // Botão próximo
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                scrollToIndex(currentIndex + 1);
                resetAutoScroll();
            });
        }
        
        // Auto-scroll
        const startAutoScroll = () => {
            autoScrollInterval = setInterval(() => {
                const itemWidth = getItemWidth();
                const maxIndex = carousel.children.length - Math.floor(container.offsetWidth / itemWidth);
                
                // Se chegou no final, volta ao início
                if (currentIndex >= maxIndex) {
                    currentIndex = -1;
                }
                
                scrollToIndex(currentIndex + 1);
            }, CONFIG.carouselSpeed);
        };
        
        // Reinicia auto-scroll após interação
        const resetAutoScroll = () => {
            clearInterval(autoScrollInterval);
            startAutoScroll();
        };
        
        // Pausa auto-scroll no hover
        container.addEventListener('mouseenter', () => {
            clearInterval(autoScrollInterval);
        });
        
        container.addEventListener('mouseleave', () => {
            startAutoScroll();
        });
        
        // Inicia auto-scroll
        startAutoScroll();
        
        // Suporte a touch/swipe
        let touchStartX = 0;
        let touchEndX = 0;
        
        carousel.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            clearInterval(autoScrollInterval);
        }, { passive: true });
        
        carousel.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
            startAutoScroll();
        }, { passive: true });
        
        const handleSwipe = () => {
            const diff = touchStartX - touchEndX;
            
            if (Math.abs(diff) > 50) { // Mínimo de 50px para considerar swipe
                if (diff > 0) {
                    // Swipe para esquerda = próximo
                    scrollToIndex(currentIndex + 1);
                } else {
                    // Swipe para direita = anterior
                    scrollToIndex(currentIndex - 1);
                }
            }
        };
    });
}

// ============================================
// 7. SCROLL BUTTON
// Botão para voltar ao topo ou ir ao final
// ============================================

/**
 * Inicializa o botão de scroll
 * Aparece após rolar 300px da página
 */
function initScrollButton() {
    const scrollBtn = document.getElementById('scroll-btn');
    
    if (!scrollBtn) return;
    
    // Mostra/esconde baseado na posição do scroll
    window.addEventListener('scroll', () => {
        const scrollPosition = window.scrollY;
        const pageHeight = document.documentElement.scrollHeight;
        const windowHeight = window.innerHeight;
        const halfPage = pageHeight / 2;
        
        // Mostra o botão após 300px de scroll
        if (scrollPosition > 300) {
            scrollBtn.classList.add('show');
            
            // Se está na metade inferior, mostra seta para cima (voltar ao topo)
            // Se está na metade superior, mostra seta para baixo (ir ao final)
            if (scrollPosition > halfPage - windowHeight) {
                scrollBtn.innerHTML = '↑';
                scrollBtn.setAttribute('data-direction', 'top');
            } else {
                scrollBtn.innerHTML = '↓';
                scrollBtn.setAttribute('data-direction', 'bottom');
            }
        } else {
            scrollBtn.classList.remove('show');
        }
    });
    
    // Ação do botão
    scrollBtn.addEventListener('click', () => {
        const direction = scrollBtn.getAttribute('data-direction');
        
        if (direction === 'top') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
        }
    });
}

// ============================================
// 8. PAGINAÇÃO
// Sistema de páginas para listagens
// ============================================

/**
 * Inicializa a paginação nas páginas de listagem
 * 
 * COMO FUNCIONA:
 * - Os cards são marcados com a classe 'pagination-item'
 * - O sistema mostra CONFIG.itemsPerPage cards por vez
 * - Cria botões de navegação automaticamente
 */
function initPagination() {
    const container = document.getElementById('listing-container');
    const paginationContainer = document.getElementById('pagination');
    
    if (!container || !paginationContainer) return;
    
    const items = container.querySelectorAll('.pagination-item');
    const totalItems = items.length;
    const totalPages = Math.ceil(totalItems / CONFIG.itemsPerPage);
    let currentPage = 1;
    
    /**
     * Mostra os itens da página atual
     */
    const showPage = (page) => {
        currentPage = page;
        const start = (page - 1) * CONFIG.itemsPerPage;
        const end = start + CONFIG.itemsPerPage;
        
        items.forEach((item, index) => {
            if (index >= start && index < end) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        });
        
        updatePaginationButtons();
        
        // Scroll para o topo da listagem
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    
    /**
     * Cria os botões de paginação
     */
    const createPaginationButtons = () => {
        paginationContainer.innerHTML = '';
        
        // Botão anterior
        const prevBtn = document.createElement('button');
        prevBtn.className = 'pagination-btn';
        prevBtn.innerHTML = '←';
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) showPage(currentPage - 1);
        });
        paginationContainer.appendChild(prevBtn);
        
        // Botões de número
        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement('button');
            btn.className = 'pagination-btn';
            btn.textContent = i;
            btn.addEventListener('click', () => showPage(i));
            paginationContainer.appendChild(btn);
        }
        
        // Botão próximo
        const nextBtn = document.createElement('button');
        nextBtn.className = 'pagination-btn';
        nextBtn.innerHTML = '→';
        nextBtn.addEventListener('click', () => {
            if (currentPage < totalPages) showPage(currentPage + 1);
        });
        paginationContainer.appendChild(nextBtn);
    };
    
    /**
     * Atualiza estado visual dos botões
     */
    const updatePaginationButtons = () => {
        const buttons = paginationContainer.querySelectorAll('.pagination-btn');
        
        buttons.forEach((btn, index) => {
            btn.classList.remove('active');
            btn.disabled = false;
            
            // Primeiro é o botão anterior
            if (index === 0) {
                btn.disabled = currentPage === 1;
            }
            // Último é o botão próximo
            else if (index === buttons.length - 1) {
                btn.disabled = currentPage === totalPages;
            }
            // Números no meio
            else {
                if (index === currentPage) {
                    btn.classList.add('active');
                }
            }
        });
    };
    
    // Inicializa se houver itens
    if (totalItems > 0) {
        createPaginationButtons();
        showPage(1);
    }
}

// ============================================
// 9. PROTEÇÃO DE IMAGENS
// Dificulta o download de imagens do site
// ============================================

/**
 * Inicializa a proteção de imagens
 * Bloqueia clique direito, arraste e menu de contexto em imagens
 * 
 * NOTA: Isso não é 100% seguro (usuários avançados podem contornar),
 * mas dificulta bastante o download casual de imagens.
 */
function initImageProtection() {
    // Bloqueia menu de contexto (clique direito) em imagens
    document.addEventListener('contextmenu', function(e) {
        if (e.target.tagName === 'IMG') {
            e.preventDefault();
            return false;
        }
    });
    
    // Bloqueia arrastar imagens
    document.addEventListener('dragstart', function(e) {
        if (e.target.tagName === 'IMG') {
            e.preventDefault();
            return false;
        }
    });
    
    // Aplica proteção adicional a todas as imagens existentes e futuras
    const applyImageProtection = () => {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            // Desabilita arrastar
            img.setAttribute('draggable', 'false');
            // Adiciona estilo para impedir seleção
            img.style.userSelect = 'none';
            img.style.webkitUserSelect = 'none';
            img.style.pointerEvents = 'auto';
        });
    };
    
    // Aplica na inicialização
    applyImageProtection();
    
    // Observa mudanças no DOM para proteger novas imagens
    const observer = new MutationObserver(applyImageProtection);
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Bloqueia combinações de teclas comuns para salvar
    document.addEventListener('keydown', function(e) {
        // Bloqueia Ctrl+S (salvar), Ctrl+Shift+I (inspetor), F12
        if ((e.ctrlKey && e.key === 's') || 
            (e.ctrlKey && e.shiftKey && e.key === 'I') ||
            (e.ctrlKey && e.shiftKey && e.key === 'i')) {
            // Não bloqueia para não atrapalhar desenvolvedores legítimos
            // Apenas bloqueia em imagens
        }
    });
    
    // Bloqueia toque longo em dispositivos móveis (long press para salvar)
    let touchTimer;
    document.addEventListener('touchstart', function(e) {
        if (e.target.tagName === 'IMG') {
            touchTimer = setTimeout(() => {
                e.preventDefault();
            }, 500);
        }
    }, { passive: false });
    
    document.addEventListener('touchend', function() {
        clearTimeout(touchTimer);
    });
    
    document.addEventListener('touchmove', function() {
        clearTimeout(touchTimer);
    });
}

// ============================================
// 10. MENU COM SUBCATEGORIAS
// Sistema de dropdown para o menu lateral
// ============================================

/**
 * Inicializa os submenus com dropdown
 * Permite expandir/colapsar categorias no menu lateral
 */
function initSubmenus() {
    const menuGroups = document.querySelectorAll('.nav-item-group');
    
    menuGroups.forEach(group => {
        const mainLink = group.querySelector('.nav-link-main');
        
        if (mainLink) {
            mainLink.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Fecha outros submenus abertos (comportamento accordion)
                menuGroups.forEach(otherGroup => {
                    if (otherGroup !== group && otherGroup.classList.contains('open')) {
                        otherGroup.classList.remove('open');
                    }
                });
                
                // Alterna o estado do submenu atual
                group.classList.toggle('open');
            });
        }
    });
}

// ============================================
// 11. SISTEMA DE BUSCA/FILTRO
// Filtra itens nas paginas de listagem
// ============================================

/**
 * Inicializa o sistema de busca nas paginas de listagem
 * 
 * COMO FUNCIONA:
 * - O usuario digita no campo de busca
 * - O sistema filtra todos os itens (mesmo em outras paginas)
 * - Mostra apenas os itens que correspondem a busca
 * - Esconde a paginacao durante a busca
 */
function initSearch() {
    const searchInput = document.getElementById('search-input');
    const searchClear = document.getElementById('search-clear');
    const container = document.getElementById('listing-container');
    const paginationContainer = document.getElementById('pagination');
    
    if (!searchInput || !container) return;
    
    const items = container.querySelectorAll('.pagination-item');
    
    // Evento de digitacao
    searchInput.addEventListener('input', debounce(() => {
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        // Mostra/esconde botao de limpar
        if (searchClear) {
            if (searchTerm.length > 0) {
                searchClear.classList.add('visible');
            } else {
                searchClear.classList.remove('visible');
            }
        }
        
        // Remove mensagem de "nenhum resultado" anterior
        const existingNoResults = container.querySelector('.no-results');
        if (existingNoResults) {
            existingNoResults.remove();
        }
        
        let visibleCount = 0;
        
        if (searchTerm === '') {
            // Se nao ha termo de busca, mostra paginacao normal
            if (paginationContainer) {
                paginationContainer.style.display = '';
            }
            // Reinicializa a paginacao
            initPagination();
        } else {
            // Esconde paginacao durante a busca
            if (paginationContainer) {
                paginationContainer.style.display = 'none';
            }
            
            // Filtra os itens
            items.forEach(item => {
                // Pega o texto do item (nome do artista ou titulo do album)
                const itemText = item.textContent.toLowerCase();
                
                if (itemText.includes(searchTerm)) {
                    item.style.display = '';
                    visibleCount++;
                } else {
                    item.style.display = 'none';
                }
            });
            
            // Mostra mensagem se nao encontrou nada
            if (visibleCount === 0) {
                const noResults = document.createElement('div');
                noResults.className = 'no-results';
                noResults.innerHTML = `Nenhum resultado encontrado para "<strong>${searchInput.value}</strong>"`;
                container.appendChild(noResults);
            }
        }
    }, 200));
    
    // Botao de limpar busca
    if (searchClear) {
        searchClear.addEventListener('click', () => {
            searchInput.value = '';
            searchClear.classList.remove('visible');
            
            // Reinicializa a paginacao
            if (paginationContainer) {
                paginationContainer.style.display = '';
            }
            initPagination();
            
            // Remove mensagem de "nenhum resultado"
            const existingNoResults = container.querySelector('.no-results');
            if (existingNoResults) {
                existingNoResults.remove();
            }
            
            // Foca no input novamente
            searchInput.focus();
        });
    }
}

// ============================================
// 12. INICIALIZAÇÃO
// Executa quando a página carrega
// ============================================

/**
 * Função principal de inicialização
 * Chamada quando o DOM está pronto
 */
function init() {
    // Inicia todos os módulos
    initSplashScreen();
    initTheme();
    initHamburgerMenu();
    initSubmenus(); // Menu com subcategorias
    initCarousels();
    initScrollButton();
    initPagination();
    initSearch(); // Sistema de busca
    initImageProtection(); // Proteção de imagens
    
    console.log('Peste do Rato - Site iniciado com sucesso!');
}

// Executa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', init);

// ============================================
// FUNÇÕES UTILITÁRIAS
// Funções auxiliares que podem ser úteis
// ============================================

/**
 * Debounce - Evita execuções repetidas muito rápidas
 * Útil para eventos de scroll e resize
 * 
 * @param {Function} func - Função a ser executada
 * @param {number} wait - Tempo de espera em ms
 */
function debounce(func, wait = 100) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Verifica se um elemento está visível na tela
 * Útil para animações de entrada
 * 
 * @param {HTMLElement} el - Elemento a verificar
 * @returns {boolean}
 */
function isInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

/**
 * Formata uma URL do Spotify
 * @param {string} albumId - ID do álbum no Spotify
 * @returns {string} URL completa
 */
function getSpotifyUrl(albumId) {
    return `https://open.spotify.com/album/${albumId}`;
}

/**
 * Formata uma URL do YouTube
 * @param {string} videoId - ID do vídeo no YouTube
 * @returns {string} URL completa
 */
function getYoutubeUrl(videoId) {
    return `https://www.youtube.com/watch?v=${videoId}`;
}
