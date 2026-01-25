# Configuração do Firebase para FrameForge

Para controlar o que é pago (PRO) e o que é grátis, você deve editar o documento `global` na coleção `config` do Firestore.

## Estrutura do Documento

**Caminho**: `config/global`

### 1. Temas Premium (`premiumThemes`)
Lista de temas que exigem PRO. Se remover um tema daqui, ele vira grátis.
*   **Tipo**: Array de Strings
*   **Valores Possíveis**:
    *   `matrix`
    *   `roblox`
    *   `minecraft`
    *   `pixel`
    *   `cyberpunk`
    *   `barbie`
    *   `redDragon`
    *   `midnightPurple`
    *   `carbonBlack`
    *   `synthwave`
    *   `custom` (Tema personalizado com foto)

### 2. Fundos Premium (`premiumBackgrounds`)
Lista de efeitos de fundo que exigem PRO.
*   **Tipo**: Array de Strings
*   **Valores Possíveis**:
    *   `matrix`
    *   `embers`
    *   `rain`
    *   `stars`
    *   `particles`
    *   `custom` (Fundo personalizado)

### 3. Funcionalidades Premium (`premiumFeatures`)
Lista de recursos funcionais que exigem PRO.
*   **Tipo**: Array de Strings
*   **Valores Atuais**:
    *   `alerts` (Alertas de temperatura/FPS)
    *   `history` (Histórico de sessões e gráficos)
    *   `rgbBorder` (Borda RGB animada)
    *   `clock` (Relógio Digital)
    *   `hardwareRenaming` (Renomear Hardware)
    *   `customFont` (Fonte Personalizada)

### O que NÃO é controlado pelo Firebase (Atualmente Grátis/Local)
Estes itens hoje são liberados para todos ou salvos apenas no celular, sem bloqueio remoto:
*   Média de Desempenho (Faz parte do resumo básico)

> [!TIP]
> Para liberar algo para todos, basta remover o nome da lista correspondente no Firebase.
> Para bloquear algo novo, adicione o nome na lista.
