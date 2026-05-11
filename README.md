#  Tela de Login Moderna

> Sistema de Autenticação Web com Interface Moderna e focada em uma boa experiência de usuário.

<p align="center">
  <img src="img/login.png" alt="Logo" width="120" />
</p>

<p align="center">
  <a href="#-tecnologias"><img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5"/></a>
  <a href="#-tecnologias"><img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3"/></a>
  <a href="#-tecnologias"><img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript"/></a>
  <a href="#-arquitetura"><img src="https://img.shields.io/badge/LocalStorage-FF6B6B?style=for-the-badge&logo=webstorage&logoColor=white" alt="LocalStorage"/></a>
</p>

---

## 🎯 Visão Geral

Deixando de ser apenas uma simples  **tela de login** é uma aplicação front-end de autenticação completa, construída com HTML5, CSS3 e JavaScript. O sistema implementa um fluxo de autenticação de ponta a ponta desde o cadastro de usuários até o painel administrativo pós-login com ênfase em **experiência de usuário (UX)**, **design visual coeso** e **micro-interações fluidas**.

A arquitetura adota o padrão **SPA-like** (Single Page Application feel) através de múltiplas páginas HTML interconectadas, compartilhando um único sistema de estilos e scripts, com estado gerenciado via `localStorage` do navegador.

### Destaques Técnicos

- 🎨 **Glassmorphism Design** — Cards com `backdrop-filter: blur(20px)`, bordas semi-transparentes e profundidade visual
- ✨ **Animações CSS Avançadas** — keyframes customizados com `cubic-bezier` easing de precisão
- 🔒 **Validação em Tempo Real** — Feedback instantâneo com estados visuais (erro/sucesso) em todos os formulários
- 📱 **Mobile-First Responsivo** — Sidebar adaptativa com drawer pattern, grid fluido e breakpoints otimizados
- ⚡ **Zero Dependências** — 100% JS, sem frameworks ou bibliotecas externas
- 🌐 **OAuth 2.0 Ready** — Integração preparada para Google, Apple, Facebook e Microsoft, basta implementar nos códigos.

---

## ✨ Funcionalidades

### Autenticação

| Funcionalidade | Descrição | Status |
|:--|:--|:--:|
| **Login** | Autenticação por e-mail ou nome de usuário | ✅ |
| **Cadastro** | Registro com validação de campos e verificação de duplicidade | ✅ |
| **Recuperação de Senha** | Wizard de 3 etapas com código de verificação simulado | ✅ |
| **Lembrar de Mim** | Persistência do identificador no localStorage | ✅ |
| **Logout** | Encerramento de sessão com modal de confirmação | ✅ |
| **Proteção de Rotas** | Redirecionamento automático baseado em estado de sessão | ✅ |

### Dashboard

| Funcionalidade | Descrição | Status |
|:--|:--|:--:|
| **Visão Geral da Conta** | Cards com estatísticas e informações do usuário | ✅ |
| **Sidebar Navegacional** | Menu fixo com avatar, links e logout | ✅ |
| **Saudação Dinâmica** | Mensagem baseada no horário do dia (Bom dia/Tarde/Noite) | ✅ |
| **Atividade Recente** | Timeline com eventos de login e criação de conta | ✅ |
| **Status de Segurança** | Indicadores visuais de senha, 2FA e sessões | ✅ |
| **Notificações** | Badge animado com contador de alertas | ✅ |

### UX/UI

| Funcionalidade | Descrição | Status |
|:--|:--|:--:|
| **Toggle de Senha** | Mostrar/ocultar senha com ícones SVG animados | ✅ |
| **Medidor de Força** | Barra progressiva de 5 níveis com cores dinâmicas | ✅ |
| **Code Inputs** | 6 campos de dígito com navegação por teclado e paste | ✅ |
| **Toast Notifications** | Alertas flutuantes com 3 tipos (success/error/info) | ✅ |
| **Loading States** | Spinners e transições em todos os botões de ação | ✅ |
| **Shake Animation** | Feedback tátil de erro nos campos inválidos | ✅ |
| **Reduced Motion** | Respeito à preferência `prefers-reduced-motion` | ✅ |

---

## 🛠 Tecnologias

### Core Stack

```
HTML5        — Estrutura semântica, formulários com validação nativa (novalidate)
CSS3         — Custom Properties, Flexbox, CSS Grid, Backdrop Filter, Keyframes
JavaScript   — ES6+, DOM API, Event Delegation, localStorage API
```

### Recursos Externos

| Recurso | Uso | URL |
|:--|:--|:--|
| **Google Fonts** | Tipografia Poppins (300-700) | `fonts.googleapis.com` |
| **OAuth Google** | Login social (placeholder) | `accounts.google.com` |
| **OAuth Apple** | Login social (placeholder) | `appleid.apple.com` |
| **OAuth Facebook** | Login social (placeholder) | `facebook.com/dialog/oauth` |
| **OAuth Microsoft** | Login social (placeholder) | `login.microsoftonline.com` |

### Assets Estáticos

```
img/
├── favicon.png    — Ícone do navegador (16x16/32x32)
└── login.png      — Logo principal da aplicação
```

---

## 🏗 Arquitetura

### Padrão de Estado

O sistema utiliza uma arquitetura **State-in-DOM** com persistência em `localStorage`. Não há framework de estado (Redux, Vuex, etc.) — o gerenciamento é feito via funções utilitárias puras que leem/escrevem no storage do navegador.

```
┌─────────────────────────────────────────┐
│              View Layer                 │
│  ┌─────────┐ ┌──────────┐ ┌─────────┐   │
│  │ index   │ │ cadastro │ │dashboard│   │
│  │.html    │ │ .html    │ │ .html   │   │
│  └────┬────┘ └────┬─────┘ └────┬────┘   │
│       │           │            │        │
│  ┌────┴───────────┴────────────┴─────┐  │
│  │        script.js (Controller)     │  │
│  │  • Validação  • localStorage API  │  │
│  │  • Animações  • DOM Manipulation  │  │
│  └───────────────────────────────────┘  │
│                   │                     │
│  ┌────────────────┴──────────────────┐  │
│  │         style.css (Presentation)  │  │
│  │  • Design System  • Animações     │  │
│  │  • Responsividade • Componentes   │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### Fluxo de Dados

```
User Input → Event Listener → Validation → localStorage Write → UI Update
                ↓                                              ↓
         DOM Query/Update                               State Rehydration
```

---

## 📁 Estrutura de Diretórios

```
TELA-LOGIN-ATUALIZADA/
│
├── 📄 index.html              # Tela de Login (entrypoint)
├── 📄 cadastro.html           # Tela de Cadastro de Usuários
├── 📄 recuperar.html          # Wizard de Recuperação de Senha
├── 📄 dashboard.html          # Painel Principal Pós-Login
├── 📄 README.md               # Documentação Técnica
│
├── 📁 css/
│   └── 🎨 style.css           # Folha de estilos unificada (1.800+ linhas)
│                              #   • Reset & Base
│                              #   • Animações CSS
│                              #   • Componentes UI
│                              #   • Layout Dashboard
│                              #   • Responsividade
│
├── 📁 js/
│   └── ⚡ script.js           # Lógica da aplicação (900+ linhas)
│                              #   • Utilitários (toast, loading, shake)
│                              #   • localStorage API (CRUD de usuários)
│                              #   • Validação de formulários
│                              #   • Fluxo de Login
│                              #   • Fluxo de Cadastro
│                              #   • Fluxo de Recuperação
│                              #   • Dashboard & Logout
│
└── 📁 img/
    ├── 🖼️ favicon.png         # Ícone da aplicação
    └── 🖼️ login.png           # Logo principal
```

### 3. Recuperação de Senha (3 Etapas)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Etapa 1   │ ──► │   Etapa 2   │ ──► │   Etapa 3   │
│  E-mail     │     │   Código    │     │ Nova Senha  │
│             │     │  (6 dígitos)│     │             │
└─────────────┘     └─────────────┘     └─────────────┘
      │                   │                   │
      ▼                   ▼                   ▼
  Valida e-mail      Gera código         Atualiza senha
  na base            aleatório 6d        no localStorage
  Simula envio       Timer 60s           Redirect login
  (console/toast)    Navegação por       ?reset=true
                     teclado + paste
```

### 4. Logout

```
Usuário clica "Sair" → Modal de confirmação → Confirma →
  clearSession() → Toast "Até logo!" →
  Redirect index.html?logout=true
```

## 💾 API de Armazenamento

### Schema de Dados (localStorage)

```typescript
interface User {
  id: string;           // Timestamp base36 + random
  name: string;         // Nome completo
  email: string;        // E-mail único
  username: string;     // Username único
  password: string;     // ⚠️ Texto puro (ver Seção Segurança)
  createdAt: string;    // ISO 8601
  loginCount: number;   // Contador de logins
  lastLogin: string | null;  // ISO 8601
}

interface Session {
  id: string;
  name: string;
  email: string;
  username: string;
  loggedInAt: string;   // ISO 8601
}
```

<p align="center">
  <sub>Boa construção focada em dar aquele upgrade em algo simples</sub>
</p>
