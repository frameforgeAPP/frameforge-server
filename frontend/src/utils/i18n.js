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
