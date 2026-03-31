1. Visão Geral do Projeto
    Tipo: Jogo 2D (Plataforma/Aventura).
    Motor: Phaser 3 (JavaScript).
    Estilo Visual: Pixel Art.
    Estrutura de Ficheiros: Assets em public/sprites/.

2. Personagens e Especificações

### Simon (12 anos)
- **Porte:** Alto (Antigo David).
- **Escala:** 1.2x.
- **Velocidade:** 220.
- **Salto:** -380.
- **Ataque:** Metralhadora (Rajada Contínua).
- **Dano:** 12 por bala.
- **Mecânica Especial:** Sobreaquecimento após 5 disparos. 
- **Sprites:** public/sprites/Simon/ (32x48).

### Dave (7 anos)
- **Porte:** Médio.
- **Escala:** 1.5x.
- **Velocidade:** 240.
- **Salto:** -420.
- **Ataque:** Arco e Flecha (Longo Alcance).
- **Dano:** 40.
- **Mecânica Especial:** Animação de recarregamento (Reloading_Crossbow) após cada tiro.
- **Sprites:** public/sprites/Dave/ (32x32).

### Matt (3 anos)
- **Porte:** Fofo (Antigo Matias).
- **Escala:** 2.0x.
- **Velocidade:** 280 (Muito Rápido).
- **Salto:** -320.
- **Ataque:** Lança projétil (Peluche/Dino).
- **Dano:** 25.
- **Sprites:** public/sprites/Matt/ (32x32).

3. Mecânicas Globais
- **Estado de Dano (Hurt):** Personagens mudam para sprite "hurt", aumentam 20% de escala e sofrem knockback durante 500ms de invulnerabilidade.
- **Itens:** 
    - `Small_Coin`: Vale 1 moeda.
    - `Coin` (Big Coin): Vale 10 moedas (sai dos baús).
    - `Heart_Spin`: Recupera 1 vida.
    - `Treasure_Chest`: Animado, liberta uma Big Coin e pop-up "+10".
- **Interface:** Barra de vida usa `Health_Indicator_White_Outline` (8x8) com animação de desaparecimento (frame 1).

4. Workflow e Automação
- **Deploy:** GitHub Actions configurado para deploy automático no GitHub Pages via branch `gh-pages`.
- **Mandato do Agente:** 
    1. **Preservação Soberana:** Alterações feitas manualmente pelo utilizador no código **NUNCA** devem ser modificadas ou revertidas pelo agente.
    2. Após cada alteração, o agente deve perguntar se deve realizar o `push`. Se confirmado, deve executar:
        - `git add .`
        - `git commit -m "Mensagem descritiva"`
        - `git push origin main`

5. Configurações Globais
- **Resolução:** 800x600 (Centrado no browser).
- **Física:** Arcade Physics (Gravidade y=1000).
- **Fonte:** `at01` (Pixel Art) utilizada em toda a UI.
- **Teclas:** ENTER (Start), R (Reset), SPACE (Ataque), P (Trocar Herói).
