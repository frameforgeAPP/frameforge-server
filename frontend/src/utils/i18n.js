/**
 * Simple Internationalization (i18n) Utility
 * Automatically detects browser language and provides translations.
 */

const translations = {
    en: {
        // Connection Screen
        "searching_server": "Searching for server...",
        "enter_ip_manually": "Enter IP Manually",
        "connect": "Connect",
        "connecting": "Connecting...",
        "server_ip_placeholder": "Server IP (e.g., 192.168.1.5)",
        "manual_connect": "Manual Connect",
        "try_again": "Try Again",
        "welcome": "Welcome!",
        "quick_setup": "FrameForge - Quick Setup",
        "requirements_title": "To work, you need:",
        "msi_afterburner_pc": "MSI Afterburner (PC)",
        "download_install_and": "Download, install and ",
        "open": "open",
        "on_pc_rivatuner": " on your PC. (RivaTuner opens with it)",
        "on_pc_to_connect": " on your PC to connect.",
        "on_pc": " on your PC.",
        "rivatuner_included": "RivaTuner is included!",
        "frameforge_server_pc": "FrameForge Server (PC)",
        "visit_afterburner_page": "1. Visit MSI Afterburner Page",
        "frameforge_server_step_2": "2. FrameForge Server",
        "send_link_instruction": "Send the link to your PC and download it there:",
        "copy": "Copy",
        "copied": "Copied!",
        "email": "Email",
        "whatsapp": "WhatsApp",
        "others": "Others",
        "dont_show_again": "Don't show again",
        "got_it_start": "Got it, let's start!",
        "tutorial_note": "You can access this tutorial again in settings",
        "demo_mode": "Demo Mode",
        "back_to_monitoring": "Back to Monitoring",
        "same_wifi": "Same Wi-Fi network.",
        "auto_connect_hint": " Automatic connection. Use QR/manual if error.",
        "cancel": "Cancel",
        "enter_server_ip": "Enter Server IP",
        "server_error_response": "Server did not respond correctly",
        "port_hint": "Port :8000 will be added automatically",
        "share_server_subject": "FrameForge Server - Download",
        "share_server_body": "Download FrameForge Server on your PC:\n\n{url}\n\nThis program is needed to send FPS data to the mobile app.",
        "share_whatsapp_text": "🎮 FrameForge Server\n\nDownload on your PC to see FPS on mobile:\n{url}",
        "share_dialog_title": "Share server link",

        // Dashboard
        "waiting_connection": "Waiting for connection...",
        "active": "ACTIVE",
        "idle": "IDLE",
        "no_signal": "NO SIGNAL",
        "connect_mobile": "Connect Mobile",
        "back_dashboard": "Back to Dashboard",
        "change_theme": "Change Theme",
        "gb_ram": "GB RAM",
        "cpu": "CPU",
        "gpu": "GPU",
        "exit_demo": "Exit Demo",
        "exit_fullscreen": "Exit Fullscreen",
        "temperature": "Temperature",
        "load": "Load",
        "cpu_processor": "CPU PROCESSOR",
        "gpu_graphics": "GPU GRAPHICS",
        "ram_memory": "RAM MEMORY",
        "system": "SYSTEM",
        "used_gb": "Used GB",
        "usage": "Usage",

        // Game Summary
        "session_complete": "Session Complete",
        "unknown_game": "Unknown Game",
        "avg_fps": "AVG FPS",
        "avg_cpu_temp": "AVG CPU TEMP",
        "avg_gpu_temp": "AVG GPU TEMP",
        "min": "MIN",
        "max": "MAX",
        "peak": "PEAK",
        "share_session": "Share Session",
        "paused": "Paused",
        "closing_in": "Closing in",
        "share_title": "FPS Monitor Session",
        "share_text": "Just finished playing {game} with {fps} FPS!",

        // Theme Selector
        "select_theme": "Select Theme",
        "initializing": "INITIALIZING SYSTEM...",
        "record_session": "Record Session",
        "support_us": "Support Us",
        "scan_instruction": "Scan this code with the FPS Monitor app on your phone.",
        "live": "LIVE",
        "manual_session": "Manual Session",
        "visual_interface": "Visual Interface System",
        "select_theme_desc": "Select a theme to customize your dashboard.",
        "active_theme": "Active",
        "performance_monitor": "Performance Monitor",
        "cancel_scanning": "Cancel Scanning",
        "scan_qr": "Scan QR Code",
        "manual_connection": "Manual Connection",
        "try_demo": "Try Demo Mode",
        "built_for_gamers": "Built for Gamers",

        // Alerts
        "alerts_settings": "Alerts",
        "alerts_enabled": "Alerts Enabled",
        "temperature_limits": "Temperature Limits",
        "minimum": "Minimum",
        "notification_type": "Notification Type",
        "vibration": "Vibration",
        "sound": "Sound",
        "test_vibration": "Test Vibration",
        "test_sound": "Test Sound",
        "reset": "Reset",
        "done": "Done",

        // Session History
        "session_history": "History",
        "confirm_clear_all": "Clear all history?",
        "compare_sessions": "Compare",
        "cancel_compare": "Cancel",
        "compare_selected": "Compare Selected",
        "no_sessions": "No sessions recorded",
        "sessions_info": "Sessions are saved automatically when you play",
        "clear_all_history": "Clear All History",

        // Export Report
        "performance_report": "Report",
        "share_report": "Share Report",
        "copied_to_clipboard": "Copied to clipboard!",
        "average": "Average",
        "maximum": "Maximum",

        // Performance Compare
        "compare_performance": "Compare",
        "max_temp": "Max Temp",
        "duration": "Duration",
        "close": "Close",

        // Tutorial
        "skip": "Skip",
        "previous": "Previous",
        "next": "Next",
        "finish": "Finish",

        // Offline
        "offline_title": "No Connection",
        "offline_message": "Check your Wi-Fi or network connection",
        "retry": "Retry",
        "install_afterburner_rivatuner": "Install/Open MSI Afterburner and RivaTuner on your PC to see FPS and CPU Temp",

        // Donation
        "support_frameforge": "Support FrameForge",
        "donation_description": "Your donation helps keep the app free and with constant updates!",
        "faster_updates": "Updates",
        "new_themes": "Themes",
        "exclusive": "Exclusive",
        "scan_pix": "Scan or copy the PIX key",
        "international_payments": "For international payments",
        "thanks_support": "Thanks for supporting!",
        "buy_coffee": "Buy me a Coffee",
        "buy_coffee_desc": "If you like the app, consider supporting the developer with a coffee!",
        "send_coffee": "Send a Coffee (R$ 5,00)",
        "via_google_play": "Via Google Play Store",
        "device_id": "Device ID",
        "copy_id": "Copy ID",
        "id_copied": "ID Copied!",
        "send_id_proof": "Send this ID with your payment proof.",
        "or_use_code": "Or use a code",
        "have_code": "I have a code",
        "hide_code": "Hide Code",
        "paste_code": "PASTE YOUR CODE HERE...",
        "code_invalid": "Invalid or expired code.",
        "premium_unlocked": "Premium features unlocked successfully!",
        "error_donation": "Error starting donation: ",
    },
    pt: {
        // Connection Screen
        "searching_server": "Procurando servidor...",
        "enter_ip_manually": "Digitar IP Manualmente",
        "connect": "Conectar",
        "connecting": "Conectando...",
        "server_ip_placeholder": "IP do Servidor (ex: 192.168.1.5)",
        "manual_connect": "Conexão Manual",
        "try_again": "Tentar Novamente",
        "welcome": "Bem-vindo!",
        "quick_setup": "FrameForge - Setup Rápido",
        "requirements_title": "Para funcionar, você precisa de:",
        "msi_afterburner_pc": "MSI Afterburner (PC)",
        "download_install_and": "Baixe, instale e ",
        "open": "abra",
        "on_pc_rivatuner": " no seu PC. (O RivaTuner abre junto)",
        "on_pc_to_connect": " no seu PC para conectar.",
        "on_pc": " no seu PC.",
        "rivatuner_included": "RivaTuner já vem incluído!",
        "frameforge_server_pc": "FrameForge Server (PC)",
        "visit_afterburner_page": "1. Visitar Página do MSI Afterburner",
        "frameforge_server_step_2": "2. FrameForge Server",
        "send_link_instruction": "Envie o link para seu PC e baixe lá:",
        "copy": "Copiar",
        "copied": "Copiado!",
        "email": "Email",
        "whatsapp": "WhatsApp",
        "others": "Outros",
        "dont_show_again": "Não mostrar novamente",
        "got_it_start": "Entendi, vamos começar!",
        "tutorial_note": "Você pode acessar este tutorial novamente nas configurações",
        "demo_mode": "Modo Demo",
        "back_to_monitoring": "Voltar ao Monitoramento",
        "same_wifi": "Mesma rede Wi-Fi.",
        "auto_connect_hint": " Conexão automática. Use QR/manual se houver erro.",
        "cancel": "Cancelar",
        "enter_server_ip": "Digite o IP do servidor",
        "server_error_response": "Servidor não respondeu corretamente",
        "port_hint": "Porta :8000 será adicionada automaticamente",
        "share_server_subject": "FrameForge Server - Download",
        "share_server_body": "Baixe o FrameForge Server no seu PC:\n\n{url}\n\nEste programa é necessário para enviar os dados de FPS para o app no celular.",
        "share_whatsapp_text": "🎮 FrameForge Server\n\nBaixe no seu PC para ver o FPS no celular:\n{url}",
        "share_dialog_title": "Compartilhar link do servidor",

        // Dashboard
        "waiting_connection": "Aguardando conexão...",
        "active": "ATIVO",
        "idle": "OCIOSO",
        "no_signal": "SEM SINAL",
        "connect_mobile": "Conectar Celular",
        "back_dashboard": "Voltar ao Painel",
        "change_theme": "Mudar Tema",
        "gb_ram": "GB RAM",
        "cpu": "CPU",
        "gpu": "GPU",
        "exit_demo": "Sair do Demo",
        "exit_fullscreen": "Sair da Tela Cheia",
        "temperature": "Temperatura",
        "load": "Carga",
        "cpu_processor": "PROCESSADOR",
        "gpu_graphics": "PLACA DE VÍDEO",
        "ram_memory": "MEMÓRIA RAM",
        "system": "SISTEMA",
        "used_gb": "GB Usado",
        "usage": "Uso",

        // Game Summary
        "session_complete": "Sessão Finalizada",
        "unknown_game": "Jogo Desconhecido",
        "avg_fps": "MÉDIA FPS",
        "avg_cpu_temp": "TEMP MÉDIA CPU",
        "avg_gpu_temp": "TEMP MÉDIA GPU",
        "min": "MÍN",
        "max": "MÁX",
        "peak": "PICO",
        "share_session": "Compartilhar",
        "paused": "Pausado",
        "closing_in": "Fechando em",
        "share_title": "Sessão FPS Monitor",
        "share_text": "Acabei de jogar {game} com {fps} FPS!",

        // Theme Selector
        "select_theme": "Selecionar Tema",
        "initializing": "INICIALIZANDO SISTEMA...",
        "record_session": "Gravar Sessão",
        "support_us": "Apoie-nos",
        "scan_instruction": "Escaneie este código com o app FPS Monitor no seu celular.",
        "live": "AO VIVO",
        "manual_session": "Sessão Manual",
        "visual_interface": "Sistema de Interface Visual",
        "select_theme_desc": "Selecione um tema para personalizar seu painel.",
        "active_theme": "Ativo",
        "performance_monitor": "Monitor de Desempenho",
        "cancel_scanning": "Cancelar Escaneamento",
        "scan_qr": "Escanear QR Code",
        "manual_connection": "Conexão Manual",
        "try_demo": "Testar Modo Demo",
        "built_for_gamers": "Feito para Gamers",

        // Alerts
        "alerts_settings": "Alertas",
        "alerts_enabled": "Alertas Ativados",
        "temperature_limits": "Limites de Temperatura",
        "minimum": "Mínimo",
        "notification_type": "Tipo de Notificação",
        "vibration": "Vibração",
        "sound": "Som",
        "test_vibration": "Testar Vibração",
        "test_sound": "Testar Som",
        "reset": "Resetar",
        "done": "Concluído",

        // Session History
        "session_history": "Histórico",
        "confirm_clear_all": "Limpar todo o histórico?",
        "compare_sessions": "Comparar",
        "cancel_compare": "Cancelar",
        "compare_selected": "Comparar Selecionadas",
        "no_sessions": "Nenhuma sessão registrada",
        "sessions_info": "As sessões são salvas automaticamente quando você joga",
        "clear_all_history": "Limpar Todo Histórico",

        // Export Report
        "performance_report": "Relatório",
        "share_report": "Compartilhar Relatório",
        "copied_to_clipboard": "Copiado para área de transferência!",
        "average": "Média",
        "maximum": "Máximo",

        // Performance Compare
        "compare_performance": "Comparar",
        "max_temp": "Temp Máx",
        "duration": "Duração",
        "close": "Fechar",

        // Tutorial
        "skip": "Pular",
        "previous": "Anterior",
        "next": "Próximo",
        "finish": "Concluir",

        // Offline
        "offline_title": "Sem Conexão",
        "offline_message": "Verifique sua conexão Wi-Fi ou rede",
        "retry": "Tentar Novamente",
        "install_afterburner_rivatuner": "Instale/Abra o MSI Afterburner e o RivaTuner no seu computador para ver o FPS e Temp do CPU",

        // Donation
        "support_frameforge": "Apoie o FrameForge",
        "donation_description": "Sua doação ajuda a manter o app gratuito e com atualizações constantes!",
        "faster_updates": "Updates",
        "new_themes": "Temas",
        "exclusive": "Exclusivo",
        "scan_pix": "Escaneie ou copie a chave PIX",
        "international_payments": "Para pagamentos internacionais",
        "thanks_support": "Obrigado por apoiar!",
        "buy_coffee": "Pague um Cafézinho",
        "buy_coffee_desc": "Se você curtiu o app, que tal apoiar o desenvolvedor com um café?",
        "send_coffee": "Enviar um Café (R$ 5,00)",
        "via_google_play": "Via Google Play Store",
        "device_id": "Seu ID de Dispositivo",
        "copy_id": "Copiar ID",
        "id_copied": "ID copiado!",
        "send_id_proof": "Envie este ID junto com o comprovante de pagamento.",
        "or_use_code": "Ou use um código",
        "have_code": "Tenho um Código",
        "hide_code": "Ocultar Código",
        "paste_code": "COLE SEU CÓDIGO AQUI...",
        "code_invalid": "Código inválido ou expirado.",
        "premium_unlocked": "Funcionalidades Premium desbloqueadas com sucesso!",
        "error_donation": "Erro ao iniciar doação: ",
    }
};

// Detect language (default to 'en')
const getLanguage = () => {
    try {
        const lang = navigator.language || navigator.userLanguage;
        return lang && lang.startsWith('pt') ? 'pt' : 'en';
    } catch (e) {
        return 'en';
    }
};

const currentLang = getLanguage();

export const t = (key, params = {}) => {
    let text = translations[currentLang][key] || translations['en'][key] || key;

    // Replace params like {game}
    Object.keys(params).forEach(param => {
        text = text.replace(`{${param}}`, params[param]);
    });

    return text;
};
