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
    welcomeMode: 'session',
    
    // ============================================
    // POPUP DE ARTISTAS - CONFIGURAÇÕES
    // ============================================
    
    // Chave para salvar se já mostrou o popup de artistas
    artistPopupStorageKey: 'pesteDoRato_artistPopupShown',
    
    // Tempo de delay para mostrar o popup após as boas-vindas (em milissegundos)
    // 500ms = meio segundo após as boas-vindas sumirem
    artistPopupDelay: 500,
    
    // ============================================
    // NAVEGACAO - CONFIGURAÇÕES
    // ============================================
    
    // Chave para saber se ja mostrou a splash screen NESTA SESSAO
    // A splash aparece APENAS quando o usuario entra no site pela primeira vez
    // Navegando entre paginas do site, a splash NAO aparece mais
    splashShownStorageKey: 'pesteDoRato_splashShown',
    
    // Chave para salvar a pagina atual da paginacao
    // Quando o usuario volta de uma pagina de artista, ele volta pra mesma pagina
    paginationStorageKey: 'pesteDoRato_pagination',
    
    // Chave para salvar a posicao do scroll
    // Quando o usuario volta, o site restaura a posicao onde ele estava
    scrollPositionStorageKey: 'pesteDoRato_scrollPosition'
};

// ============================================
// 2. SPLASH SCREEN
// Tela de carregamento com logo e animação
// ============================================

/**
 * Controla a exibição da splash screen
 * 
 * ============================================
 * COMPORTAMENTO DA SPLASH SCREEN
 * ============================================
 * 
 * A splash screen APENAS aparece quando o usuario ENTRA no site
 * pela primeira vez nessa sessao do navegador.
 * 
 * Quando o usuario navega DENTRO do site (ex: clica em um artista
 * e depois volta), a splash NAO aparece mais.
 * 
 * Isso melhora a experiencia de navegacao porque o usuario nao
 * precisa esperar a splash toda vez que muda de pagina.
 * 
 * COMO FUNCIONA:
 * - Quando a splash aparece, marca no sessionStorage
 * - Se ja foi marcada, pula a splash e vai direto pro conteudo
 * - O sessionStorage limpa quando fecha o navegador, entao
 *   na proxima visita a splash aparece novamente
 * 
 * COMO MODIFICAR:
 * - Para mudar o tempo: altere CONFIG.splashDuration
 * - Para desativar: comente a chamada initSplashScreen() na função init()
 * ============================================
 */
function initSplashScreen() {
    const splashScreen = document.getElementById('splash-screen');
    
    if (!splashScreen) return;
    
    // Verifica se a splash ja foi mostrada NESTA SESSAO
    const splashAlreadyShown = sessionStorage.getItem(CONFIG.splashShownStorageKey);
    
    if (splashAlreadyShown) {
        // Ja mostrou a splash nessa sessao, pula direto pro conteudo
        splashScreen.classList.add('hide');
        splashScreen.style.display = 'none';
        
        // Verifica se deve mostrar boas-vindas (caso ainda nao tenha mostrado)
        checkWelcomeScreen();
        return;
    }
    
    // Marca que a splash foi mostrada nessa sessao
    sessionStorage.setItem(CONFIG.splashShownStorageKey, 'true');
    
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
    } else {
        // Se não mostrou boas-vindas, ainda assim verifica o popup de artistas
        // (caso seja a primeira vez que o popup seria mostrado)
        setTimeout(() => {
            checkArtistPopup();
        }, CONFIG.artistPopupDelay);
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
        
        // Verifica se deve mostrar o popup de artistas
        setTimeout(() => {
            checkArtistPopup();
        }, CONFIG.artistPopupDelay);
    }, CONFIG.welcomeDuration);
}

// ============================================
// 3.1 POPUP DE ARTISTAS
// Aparece apenas UMA VEZ (nunca mais) para convidar artistas
// ============================================

/**
 * Verifica se deve mostrar o popup de artistas
 * O popup aparece apenas UMA VEZ para o usuário (salvo no localStorage)
 * 
 * COMO RESETAR (para mostrar novamente):
 * Abra o console do navegador (F12) e digite: resetArtistPopup()
 */
function checkArtistPopup() {
    const artistPopup = document.getElementById('artist-popup');
    
    if (!artistPopup) return;
    
    // Verifica se já foi mostrado anteriormente (usando localStorage para persistir)
    const alreadyShown = localStorage.getItem(CONFIG.artistPopupStorageKey);
    
    if (!alreadyShown) {
        showArtistPopup();
    }
}

/**
 * Mostra o popup de artistas com animação
 */
function showArtistPopup() {
    const artistPopup = document.getElementById('artist-popup');
    const closeBtn = document.getElementById('artist-popup-close');
    
    if (!artistPopup) return;
    
    // Mostra o popup
    artistPopup.classList.add('show');
    
    // Marca como já mostrado (nunca mais vai aparecer)
    localStorage.setItem(CONFIG.artistPopupStorageKey, 'true');
    
    // Evento de clique no botão de fechar
    if (closeBtn) {
        closeBtn.addEventListener('click', hideArtistPopup);
    }
    
    // Fecha ao clicar fora do conteúdo (no overlay)
    artistPopup.addEventListener('click', (e) => {
        if (e.target === artistPopup) {
            hideArtistPopup();
        }
    });
    
    // Fecha ao pressionar ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideArtistPopup();
        }
    });
}

/**
 * Esconde o popup de artistas
 */
function hideArtistPopup() {
    const artistPopup = document.getElementById('artist-popup');
    
    if (!artistPopup) return;
    
    artistPopup.classList.remove('show');
    artistPopup.classList.add('hide');
}

/**
 * Função para resetar o popup de artistas (útil para testes)
 * Chame esta função no console: resetArtistPopup()
 */
function resetArtistPopup() {
    localStorage.removeItem(CONFIG.artistPopupStorageKey);
    console.log('Popup de artistas resetado! Recarregue a página.');
}

// Disponibiliza a função globalmente para uso no console
window.resetArtistPopup = resetArtistPopup;

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

/**
 * Função para resetar a splash screen (útil para testes)
 * Chame esta função no console: resetSplash()
 * 
 * Isso faz a splash aparecer novamente ao recarregar a página
 */
function resetSplash() {
    sessionStorage.removeItem(CONFIG.splashShownStorageKey);
    console.log('Splash screen resetada! Recarregue a página para ver novamente.');
}

// Disponibiliza a função globalmente para uso no console
window.resetSplash = resetSplash;

/**
 * Função para resetar toda a navegacao (útil para testes)
 * Chame esta função no console: resetNavigation()
 * 
 * Isso limpa:
 * - Splash screen (vai aparecer novamente)
 * - Posicoes de scroll salvas
 * - Paginas de paginacao salvas
 */
function resetNavigation() {
    // Limpa splash
    sessionStorage.removeItem(CONFIG.splashShownStorageKey);
    
    // Limpa todas as posicoes de scroll e paginacao
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
        const key = sessionStorage.key(i);
        if (key && (key.includes('scrollPosition') || key.includes('pagination'))) {
            sessionStorage.removeItem(key);
        }
    }
    
    console.log('Navegacao resetada! Recarregue a página.');
}

// Disponibiliza a função globalmente para uso no console
window.resetNavigation = resetNavigation;

// ============================================
// 4. TEMA DARK/LIGHT
// Alterna entre modo escuro e claro
// ============================================

/**
 * Inicializa o sistema de temas
 * O tema é salvo no navegador e permanece ao recarregar
 * 
 * ============================================
 * COMO FUNCIONA A TROCA DE LOGOS
 * ============================================
 * 
 * As logos agora são trocadas AUTOMATICAMENTE via CSS!
 * O CSS usa as classes .logo-dark e .logo-light para mostrar/esconder
 * as logos corretas baseado no tema atual.
 * 
 * NAO precisa mais de JavaScript para trocar as logos!
 * Basta ter as duas <img> no HTML com as classes corretas.
 * 
 * ONDE ALTERAR AS LOGOS (no HTML):
 * 
 * NAVBAR (logo deitada):
 *   - Modo ESCURO: class="logo-img logo-dark" 
 *     Arquivo: /images/logodeitadabranca.png
 *   - Modo CLARO: class="logo-img logo-light"
 *     Arquivo: /images/logodeitadapreta.png
 * 
 * SPLASH SCREEN (logo quadrada):
 *   - Modo ESCURO: class="splash-logo logo-dark"
 *     Arquivo: /images/logopestedoratobranca.png
 *   - Modo CLARO: class="splash-logo logo-light"
 *     Arquivo: /images/logopestedoratopreta.png
 * 
 * HERO (logo quadrada):
 *   - Modo ESCURO: class="hero-image logo-dark"
 *     Arquivo: /images/logopestedoratobranca.png
 *   - Modo CLARO: class="hero-image logo-light"
 *     Arquivo: /images/logopestedoratopreta.png
 * ============================================
 */
function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    
    // Carrega tema salvo (ou usa 'dark' como padrão)
    const savedTheme = localStorage.getItem(CONFIG.themeStorageKey) || 'dark';
    
    // Aplica o tema salvo
    // A troca de logos e feita AUTOMATICAMENTE pelo CSS (classes logo-dark e logo-light)
    if (savedTheme === 'light') {
        body.classList.add('light-mode');
        updateThemeIcon(true);
        // NAO precisa mais chamar updateLogo() - o CSS faz isso automaticamente!
    }
    
    // Adiciona evento de clique no botão
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}

/**
 * Alterna entre tema escuro e claro
 * 
 * A troca de logos e feita AUTOMATICAMENTE pelo CSS!
 * Quando o body ganha/perde a classe 'light-mode',
 * o CSS mostra/esconde as logos certas (logo-dark e logo-light).
 */
function toggleTheme() {
    const body = document.body;
    const isLight = body.classList.toggle('light-mode');
    
    // Salva preferência
    localStorage.setItem(CONFIG.themeStorageKey, isLight ? 'light' : 'dark');
    
    // Atualiza apenas o icone (sol/lua) para acessibilidade
    // A troca de logos e feita AUTOMATICAMENTE pelo CSS!
    updateThemeIcon(isLight);
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
 * ============================================
 * FUNCAO OBSOLETA - NAO E MAIS UTILIZADA
 * ============================================
 * 
 * ANTES: Esta funcao trocava as logos via JavaScript.
 * AGORA: A troca e feita AUTOMATICAMENTE pelo CSS!
 * 
 * O CSS usa as classes .logo-dark e .logo-light para mostrar/esconder
 * as logos automaticamente quando o tema muda.
 * 
 * ┌─────────────────────────────────────────────────────────────────┐
 * │ PARA ALTERAR AS LOGOS, EDITE NO HTML:                          │
 * ├─────────────────────────────────────────────────────────────────┤
 * │ NAVBAR (logo deitada):                                         │
 * │   Modo ESCURO: src da img com class="logo-img logo-dark"       │
 * │   Modo CLARO:  src da img com class="logo-img logo-light"      │
 * ├─────────────────────────────────────────────────────────────────┤
 * │ SPLASH SCREEN (logo quadrada):                                 │
 * │   Modo ESCURO: src da img com class="splash-logo logo-dark"    │
 * │   Modo CLARO:  src da img com class="splash-logo logo-light"   │
 * ├─────────────────────────────────────────────────────────────────┤
 * │ HERO (logo quadrada):                                          │
 * │   Modo ESCURO: src da img com class="hero-image logo-dark"     │
 * │   Modo CLARO:  src da img com class="hero-image logo-light"    │
 * └─────────────────────────────────────────────────────────────────┘
 * 
 * Esta funcao esta aqui apenas para referencia e nao e mais chamada.
 */
function updateLogo(isLight) {
    // FUNCAO NAO UTILIZADA - A troca de logos agora e feita via CSS
    // Veja os comentarios acima para saber onde alterar as imagens no HTML
    console.log('[updateLogo] Esta funcao nao e mais necessaria. A troca de logos e feita via CSS.');
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
 * ============================================
 * COMPORTAMENTO DA PAGINACAO
 * ============================================
 * 
 * Quando o usuario esta na pagina 2, 3, etc de uma listagem
 * e clica em um artista, ao voltar ele retorna para a MESMA PAGINA
 * onde estava, nao para a pagina 1.
 * 
 * COMO FUNCIONA:
 * - A pagina atual e salva na URL (ex: ?page=3)
 * - Quando o usuario volta, o sistema le a URL e vai pra pagina correta
 * - O sessionStorage tambem guarda a pagina por categoria
 * 
 * EXEMPLO:
 * - Usuario esta em hiphop-mcs.html na pagina 3
 * - Clica no MC HIRLA para ver o perfil
 * - Ao voltar (botao voltar do navegador), volta pra pagina 3
 * ============================================
 * 
 * COMO FUNCIONA TECNICAMENTE:
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
    
    // Pega a pagina da URL atual (para lembrar onde o usuario estava)
    const currentPath = window.location.pathname;
    const storageKey = CONFIG.paginationStorageKey + '_' + currentPath;
    
    /**
     * Pega a pagina salva (da URL ou do sessionStorage)
     */
    const getSavedPage = () => {
        // Primeiro tenta pegar da URL (ex: ?page=3)
        const urlParams = new URLSearchParams(window.location.search);
        const pageFromUrl = parseInt(urlParams.get('page'));
        
        if (pageFromUrl && pageFromUrl >= 1 && pageFromUrl <= totalPages) {
            return pageFromUrl;
        }
        
        // Se nao tem na URL, tenta pegar do sessionStorage
        const savedPage = parseInt(sessionStorage.getItem(storageKey));
        if (savedPage && savedPage >= 1 && savedPage <= totalPages) {
            return savedPage;
        }
        
        return 1; // Padrao: pagina 1
    };
    
    /**
     * Salva a pagina atual (na URL e no sessionStorage)
     */
    const savePage = (page) => {
        // Salva no sessionStorage
        sessionStorage.setItem(storageKey, page.toString());
        
        // Atualiza a URL sem recarregar a pagina
        const url = new URL(window.location);
        if (page > 1) {
            url.searchParams.set('page', page.toString());
        } else {
            url.searchParams.delete('page');
        }
        window.history.replaceState({}, '', url);
    };
    
    /**
     * Mostra os itens da página atual
     * @param {number} page - Numero da pagina
     * @param {boolean} scrollToTop - Se deve fazer scroll pro topo (padrao: true)
     */
    const showPage = (page, scrollToTop = true) => {
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
        
        // Salva a pagina atual
        savePage(page);
        
        // Scroll para o topo da listagem (apenas se solicitado)
        if (scrollToTop) {
            container.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
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
        
        // Pega a pagina salva e mostra ela (sem scroll se estiver voltando)
        const savedPage = getSavedPage();
        const isReturning = savedPage > 1;
        showPage(savedPage, !isReturning); // Nao faz scroll se estiver voltando pra pagina salva
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
// 12. SISTEMA DE MEMORIA DE NAVEGACAO
// Salva e restaura a posicao do scroll e do carrossel
// ============================================

/**
 * ============================================
 * SISTEMA DE MEMORIA DE NAVEGACAO
 * ============================================
 * 
 * Este sistema melhora a experiencia de navegacao:
 * 
 * 1. POSICAO DO SCROLL:
 *    - Quando o usuario clica em um artista, salva onde ele estava
 *    - Quando ele volta (botao voltar), restaura a posicao exata
 *    - Assim ele nao precisa rolar a pagina de novo pra achar onde estava
 * 
 * 2. POSICAO DO CARROSSEL:
 *    - Se o usuario estava no meio de um carrossel, salva a posicao
 *    - Quando volta, o carrossel esta na mesma posicao
 * 
 * COMO FUNCIONA:
 * - Usa sessionStorage para guardar a posicao por pagina
 * - Quando o usuario clica em um link, salva a posicao atual
 * - Quando a pagina carrega, verifica se tem posicao salva e restaura
 * ============================================
 */

/**
 * Inicializa o sistema de memoria de navegacao
 */
function initNavigationMemory() {
    const currentPath = window.location.pathname;
    const storageKey = CONFIG.scrollPositionStorageKey + '_' + currentPath;
    
    // Restaura a posicao do scroll se existir
    const savedPosition = sessionStorage.getItem(storageKey);
    
    if (savedPosition) {
        // Aguarda um pouco para a pagina terminar de carregar
        // e depois restaura a posicao
        setTimeout(() => {
            window.scrollTo({
                top: parseInt(savedPosition),
                behavior: 'auto' // Instantaneo, sem animacao
            });
        }, 100);
        
        // Limpa a posicao salva (para nao restaurar se recarregar a pagina)
        sessionStorage.removeItem(storageKey);
    }
    
    // Salva a posicao do scroll quando o usuario clica em um link interno
    document.addEventListener('click', (e) => {
        // Verifica se clicou em um link
        const link = e.target.closest('a');
        
        if (link && link.href) {
            // Verifica se e um link interno (mesmo dominio)
            const linkUrl = new URL(link.href);
            const currentUrl = new URL(window.location.href);
            
            // Se for link interno (mesmo dominio e nao e ancora)
            if (linkUrl.hostname === currentUrl.hostname && !link.href.startsWith('#')) {
                // Salva a posicao atual do scroll
                const scrollPosition = window.scrollY;
                sessionStorage.setItem(storageKey, scrollPosition.toString());
            }
        }
    });
    
    // Tambem salva quando o usuario usa o botao voltar/avancar do navegador
    window.addEventListener('beforeunload', () => {
        // Nao salva se estiver no topo da pagina
        if (window.scrollY > 100) {
            sessionStorage.setItem(storageKey, window.scrollY.toString());
        }
    });
}

// ============================================
// 13. CARROSSEL DE POSTS (MINI BLOG)
// Carrossel especial para os posts do blog
// ============================================

/**
 * Inicializa o carrossel de posts da página inicial
 * 
 * FUNCIONALIDADES:
 * - No mobile: 1 post por vez com transição suave
 * - No desktop: múltiplos posts visíveis
 * - Navegação por setas e bolinhas (indicadores)
 * - Suporte a touch/swipe em dispositivos móveis
 * - Auto-play opcional (desativado por padrão)
 * 
 * COMO MODIFICAR:
 * - autoPlay: true/false - ativa/desativa rotação automática
 * - autoPlayInterval: tempo em ms entre cada troca (padrão: 5000)
 */
function initPostsCarousel() {
    const carousel = document.getElementById('posts-carousel');
    const indicatorsContainer = document.getElementById('posts-indicators');
    const prevBtn = document.querySelector('.posts-prev');
    const nextBtn = document.querySelector('.posts-next');
    
    if (!carousel) return; // Se não existe o carrossel, não faz nada
    
    const posts = carousel.querySelectorAll('.post-card');
    const totalPosts = posts.length;
    
    if (totalPosts === 0) return;
    
    let currentIndex = 0;
    let autoPlayTimer = null;
    
    // Configurações
    const config = {
        autoPlay: false,           // Mude para true se quiser auto-play
        autoPlayInterval: 5000,    // Tempo entre cada troca (5 segundos)
    };
    
    /**
     * Calcula quantos posts são visíveis baseado na largura da tela
     * @returns {number} Número de posts visíveis
     */
    const getVisibleCount = () => {
        const width = window.innerWidth;
        if (width < 768) return 1;       // Mobile: 1 post
        if (width < 1024) return 2;      // Tablet: 2 posts
        return 3;                         // Desktop: 3 posts
    };
    
    /**
     * Calcula a posição do carrossel para mostrar o post no índice
     * @param {number} index - Índice do post
     */
    const scrollToIndex = (index) => {
        const visibleCount = getVisibleCount();
        const maxIndex = Math.max(0, totalPosts - visibleCount);
        
        // Limita o índice
        currentIndex = Math.max(0, Math.min(index, maxIndex));
        
        // Calcula a porcentagem de deslocamento
        // Cada post ocupa 100%/visibleCount do container
        const percentage = (currentIndex * 100) / visibleCount;
        
        // Aplica o deslocamento
        carousel.style.transform = `translateX(-${percentage}%)`;
        
        // Atualiza indicadores
        updateIndicators();
        
        // Atualiza estado dos botões
        updateButtons();
    };
    
    /**
     * Cria os indicadores (bolinhas) de navegação
     */
    const createIndicators = () => {
        if (!indicatorsContainer) return;
        
        const visibleCount = getVisibleCount();
        const totalIndicators = Math.ceil(totalPosts / visibleCount);
        
        indicatorsContainer.innerHTML = '';
        
        for (let i = 0; i < totalIndicators; i++) {
            const indicator = document.createElement('button');
            indicator.className = 'posts-indicator';
            indicator.setAttribute('aria-label', `Ir para slide ${i + 1}`);
            indicator.addEventListener('click', () => {
                scrollToIndex(i * visibleCount);
                resetAutoPlay();
            });
            indicatorsContainer.appendChild(indicator);
        }
        
        updateIndicators();
    };
    
    /**
     * Atualiza qual indicador está ativo
     */
    const updateIndicators = () => {
        if (!indicatorsContainer) return;
        
        const indicators = indicatorsContainer.querySelectorAll('.posts-indicator');
        const visibleCount = getVisibleCount();
        const activeIndex = Math.floor(currentIndex / visibleCount);
        
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === activeIndex);
        });
    };
    
    /**
     * Atualiza estado dos botões prev/next
     */
    const updateButtons = () => {
        const visibleCount = getVisibleCount();
        const maxIndex = Math.max(0, totalPosts - visibleCount);
        
        if (prevBtn) {
            prevBtn.disabled = currentIndex === 0;
        }
        
        if (nextBtn) {
            nextBtn.disabled = currentIndex >= maxIndex;
        }
    };
    
    /**
     * Vai para o próximo slide
     */
    const goToNext = () => {
        const visibleCount = getVisibleCount();
        scrollToIndex(currentIndex + visibleCount);
    };
    
    /**
     * Vai para o slide anterior
     */
    const goToPrev = () => {
        const visibleCount = getVisibleCount();
        scrollToIndex(currentIndex - visibleCount);
    };
    
    /**
     * Inicia auto-play
     */
    const startAutoPlay = () => {
        if (!config.autoPlay) return;
        
        stopAutoPlay();
        autoPlayTimer = setInterval(() => {
            const visibleCount = getVisibleCount();
            const maxIndex = Math.max(0, totalPosts - visibleCount);
            
            if (currentIndex >= maxIndex) {
                scrollToIndex(0); // Volta ao início
            } else {
                goToNext();
            }
        }, config.autoPlayInterval);
    };
    
    /**
     * Para auto-play
     */
    const stopAutoPlay = () => {
        if (autoPlayTimer) {
            clearInterval(autoPlayTimer);
            autoPlayTimer = null;
        }
    };
    
    /**
     * Reinicia auto-play após interação
     */
    const resetAutoPlay = () => {
        stopAutoPlay();
        startAutoPlay();
    };
    
    // Event Listeners para botões
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            goToPrev();
            resetAutoPlay();
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            goToNext();
            resetAutoPlay();
        });
    }
    
    // Suporte a touch/swipe
    let touchStartX = 0;
    let touchEndX = 0;
    
    carousel.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        stopAutoPlay();
    }, { passive: true });
    
    carousel.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
        startAutoPlay();
    }, { passive: true });
    
    const handleSwipe = () => {
        const diff = touchStartX - touchEndX;
        const minSwipe = 50; // Mínimo de 50px para considerar swipe
        
        if (Math.abs(diff) > minSwipe) {
            if (diff > 0) {
                // Swipe para esquerda = próximo
                goToNext();
            } else {
                // Swipe para direita = anterior
                goToPrev();
            }
        }
    };
    
    // Pausa auto-play no hover
    carousel.addEventListener('mouseenter', stopAutoPlay);
    carousel.addEventListener('mouseleave', startAutoPlay);
    
    // Atualiza ao redimensionar a janela
    window.addEventListener('resize', debounce(() => {
        createIndicators();
        scrollToIndex(currentIndex);
    }, 200));
    
    // Inicializa
    createIndicators();
    updateButtons();
    startAutoPlay();
}

// ============================================
// 14. INICIALIZAÇÃO
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
    initPostsCarousel(); // Carrossel de posts (novo)
    initScrollButton();
    initPagination();
    initSearch(); // Sistema de busca
    initImageProtection(); // Proteção de imagens
    initNavigationMemory(); // Sistema de memoria de navegacao
    
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
