1. Visão Geral do Projeto
    Tipo: Jogo 2D (Plataforma/Aventura).
    Motor: Phaser 3 (JavaScript).
    Estilo Visual: Pixel Art.
    Estrutura de Ficheiros: Assets em public/chars/.

2. Personagens e Especificações

### Simon (12 anos)
- **Porte:** Alto (Antigo David).
- **Escala:** 1.2x.
- **Velocidade:** 220.
- **Salto:** -380.
- **Ataque:** Metralhadora (Rajada Contínua).
- **Dano:** 12 por bala.
- **Mecânica Especial:** Sobreaquecimento após 5 disparos. 
- **Sprites:** public/chars/Simon/ (32x48).

### Dave (7 anos)
- **Porte:** Médio.
- **Escala:** 1.5x.
- **Velocidade:** 240.
- **Salto:** -420.
- **Ataque:** Arco e Flecha (Longo Alcance).
- **Dano:** 40.
- **Sprites:** public/chars/Dave/ (32x32).

### Matt (3 anos)
- **Porte:** Fofo (Antigo Matias).
- **Escala:** 2.0x.
- **Velocidade:** 280 (Muito Rápido).
- **Salto:** -320.
- **Ataque:** Lança projétil (Peluche/Dino).
- **Dano:** 25.
- **Sprites:** public/chars/Matt/ (32x32).

3. Assets Partilhados (public/chars/common/)
- **Bala:** bullet.png (Simon e Matt).
- **Flecha:** arrow.png (Dave).

4. Arquitetura do Código
- **SplashScene:** Carregamento de assets e ecrã inicial.
- **MenuScene:** Seleção de personagem (Simon, Dave, Matt).
- **GameScene:** Lógica principal e troca de heróis (Tecla P).
- **Player.js:** Classe central que gere animações, stats e ataques específicos.

5. Configurações Globais
- **Resolução:** 800x600.
- **Física:** Arcade Physics (Gravidade y=1000).
- **Teclas:** ENTER (Start), R (Reset), SPACE (Ataque), P (Trocar Herói).
