# Quiz Médico - Saúde da Mulher

## 📱 Progressive Web App (PWA)

Aplicação de quiz interativa para estudo de ginecologia e obstetrícia, desenvolvida para estudantes de medicina. Funciona 100% offline após a primeira visita.

## ✨ Funcionalidades

### Modos de Estudo
- **Modo Simulado**: Teste seus conhecimentos com feedback apenas ao final
- **Modo Estudo**: Aprenda com feedback imediato e explicações detalhadas

### Sistema de Avaliação
- **Nota em tempo real**: Acompanhe seu desempenho durante o quiz
- **Captura de confiança**: Slider de 0-100% para cada resposta
- **Brier Score**: Métrica de calibração entre confiança e acertos
- **Análise por tema**: Gráficos interativos mostrando desempenho por categoria

### Recursos Adicionais
- **Marcação de questões**: Sinalize questões para revisão posterior
- **Riscar alternativas**: Elimine opções incorretas (duplo clique)
- **Timer**: Acompanhe o tempo gasto em cada questão
- **Dark/Light mode**: Interface adaptável à preferência do usuário
- **100% Responsivo**: Otimizado para dispositivos móveis e desktop
- **Offline First**: Funciona sem conexão após instalação

## 📚 Conteúdo

20 questões do núcleo de Saúde da Mulher, abordando:
- Pré-natal e acompanhamento gestacional
- Fisiologia do ciclo menstrual
- Puberdade e desenvolvimento feminino
- Saúde da adolescente
- Prevenção em ginecologia

## 🚀 Como Usar

### Online
Acesse diretamente pelo navegador: [Link será adicionado após deploy]

### Instalação como App
1. Acesse o site pelo navegador móvel
2. Toque no menu do navegador
3. Selecione "Adicionar à tela inicial"
4. O app funcionará offline após instalação

### Desenvolvimento Local
```bash
# Clone o repositório
git clone [url-do-repositorio]

# Entre no diretório
cd quiz-final

# Inicie um servidor local
python3 -m http.server 8000

# Acesse no navegador
http://localhost:8000
```

## 📊 Análise de Desempenho

Após completar o quiz, você terá acesso a:
- Score geral com visualização em gráfico circular
- Tempo total e tempo por questão
- Análise detalhada por tema/categoria
- Recomendações personalizadas de estudo
- Revisão completa de todas as questões
- Exportação de resultados em JSON

## 🛠️ Tecnologias

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Gráficos**: Chart.js
- **PWA**: Service Worker, Web App Manifest
- **Storage**: LocalStorage para persistência de dados
- **Design**: Mobile-first, Dark/Light themes

## 📱 Compatibilidade

- Chrome/Edge 80+
- Firefox 75+
- Safari 13+
- Chrome Mobile
- Safari iOS

## 🔒 Privacidade

- Todos os dados são armazenados localmente no dispositivo
- Nenhuma informação é enviada para servidores externos
- Funciona completamente offline após primeira visita

## 📈 Métricas de Aprendizado

### Brier Score
Métrica que avalia a calibração entre confiança e acertos. Quanto menor o score, melhor a calibração:
- 0.00 - 0.10: Excelente calibração
- 0.10 - 0.25: Boa calibração
- 0.25 - 0.50: Calibração moderada
- \> 0.50: Necessita melhorar autoavaliação

### Análise por Tema
Identifica áreas de força e oportunidades de melhoria baseado em:
- Taxa de acerto por categoria
- Tempo médio por questão
- Nível de confiança vs. desempenho real

## 🎯 Evidências Científicas

A aplicação implementa princípios baseados em evidências:
- **Test-enhanced learning** (Roediger & Karpicke, 2006)
- **Confidence-Based Marking** (Gardner-Medwin, UCL)
- **Spaced repetition** (Cepeda et al., 2006)
- **Gamificação educacional** (Sailer & Homner, 2020)

## 📄 Licença

Desenvolvido para fins educacionais - 2025

## 👥 Contribuições

Sugestões e melhorias são bem-vindas! Abra uma issue ou envie um pull request.

---

**Desenvolvido com 💙 para estudantes de medicina**