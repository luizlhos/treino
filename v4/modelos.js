/* Modelos prontos de treino — base editável pelo master (Perfil → Modelos de treino).
   Formato de cada exercício: [nome exato do banco de exercícios, séries, repetições, descanso em segundos].
   O objetivo (massa, gordura, saúde, iniciante) é aplicado por cima na criação do plano (applyGoal). */
(function (w) {
  'use strict';
  const S = (name, groups, duration, ex) => ({ name, groups, duration, ex });
  // ---------- ACADEMIA ----------
  const pushA = S('Peito, ombros e tríceps', 'Peito · Ombros · Tríceps', '55–65 min', [
    ['Supino Reto com Barra', 4, '8–12', 120], ['Supino Inclinado com Halteres', 3, '10–12', 90], ['Desenvolvimento com Halteres', 3, '10–12', 90],
    ['Elevação Lateral com Halteres', 3, '12–15', 60], ['Crossover Polia Média', 3, '12–15', 60], ['Tríceps Pulley (corda)', 3, '10–12', 60]]);
  const pullA = S('Costas e bíceps', 'Costas · Bíceps · Ombro posterior', '55–65 min', [
    ['Puxada Frontal Pronada', 4, '8–12', 90], ['Remada Curvada com Barra Pronada', 4, '8–12', 120], ['Remada Sentada na Polia (triângulo)', 3, '10–12', 90],
    ['Face Pull na Polia', 3, '12–15', 60], ['Rosca Direta com Barra', 3, '10–12', 60], ['Rosca Martelo', 3, '12–15', 60]]);
  const legsA = S('Pernas e abdômen', 'Quadríceps · Posterior · Glúteos · Core', '60–70 min', [
    ['Agachamento Livre com Barra', 4, '8–12', 150], ['Leg Press 45°', 3, '10–12', 120], ['Levantamento Terra Romeno (Stiff)', 3, '10–12', 120],
    ['Cadeira Extensora', 3, '12–15', 60], ['Mesa Flexora (deitado)', 3, '12–15', 60], ['Panturrilha em Pé na Máquina', 4, '15–20', 45], ['Prancha Frontal', 3, '30–60', 45]]);
  // ---------- CASA (halteres + peso do corpo) ----------
  const cPush = S('Peito, ombros e tríceps', 'Peito · Ombros · Tríceps', '45–55 min', [
    ['Flexão de Braço', 4, '8–15', 90], ['Supino Reto com Halteres', 3, '10–12', 90], ['Desenvolvimento com Halteres', 3, '10–12', 90],
    ['Elevação Lateral com Halteres', 3, '12–15', 60], ['Flexão Diamante', 3, '8–12', 60], ['Tríceps Francês com Halter', 3, '10–12', 60]]);
  const cPull = S('Costas e bíceps', 'Costas · Bíceps · Lombar', '45–55 min', [
    ['Remada Unilateral com Halter (serrote)', 4, '10–12', 60], ['Remada Curvada com Halteres', 4, '10–12', 60], ['Pullover com Halter', 3, '12–15', 60],
    ['Crucifixo Inverso com Halteres', 3, '12–15', 60], ['Rosca Alternada com Halteres', 3, '10–12', 60], ['Rosca Martelo', 3, '12–15', 60], ['Superman (extensão lombar no solo)', 3, '12–15', 45]]);
  const cLegs = S('Pernas e abdômen', 'Quadríceps · Posterior · Glúteos · Core', '50–60 min', [
    ['Agachamento Goblet', 4, '12–15', 90], ['Agachamento Búlgaro', 3, '10–12', 90], ['Stiff com Halteres', 4, '10–12', 90],
    ['Elevação Pélvica (glute bridge)', 3, '15–20', 60], ['Afundo Estático', 3, '10–12', 60], ['Panturrilha Unilateral com Halter', 3, '12–15', 45], ['Prancha Frontal', 3, '30–60', 45]]);

  const list = [
    { id: 'd2-acad', name: 'Corpo todo A/B · 2 dias · academia', days: 2, place: 'academia', level: 'normal', sessions: [
      S('Corpo todo A', 'Pernas · Peito · Costas · Ombros', '60–70 min', [
        ['Agachamento Livre com Barra', 4, '8–12', 120], ['Supino Reto com Barra', 4, '8–12', 120], ['Puxada Frontal Pronada', 4, '8–12', 90],
        ['Mesa Flexora (deitado)', 3, '10–12', 60], ['Desenvolvimento com Halteres', 3, '10–12', 90], ['Rosca Direta com Barra', 3, '10–12', 60], ['Prancha Frontal', 3, '30–60', 45]]),
      S('Corpo todo B', 'Posterior · Peito · Costas · Ombros', '60–70 min', [
        ['Levantamento Terra Romeno (Stiff)', 4, '8–12', 120], ['Leg Press 45°', 3, '10–12', 90], ['Supino Inclinado com Halteres', 3, '10–12', 90],
        ['Remada Curvada com Barra Pronada', 4, '8–12', 90], ['Elevação Lateral com Halteres', 3, '12–15', 60], ['Tríceps Pulley (corda)', 3, '10–12', 60], ['Abdominal Infra (elevação de quadril)', 3, '15–20', 45]])] },
    { id: 'd3-acad', name: 'Empurrar · Puxar · Pernas · 3 dias · academia', days: 3, place: 'academia', level: 'normal', sessions: [pushA, pullA, legsA] },
    { id: 'd4-acad', name: 'Superiores / Inferiores · 4 dias · academia', days: 4, place: 'academia', level: 'normal', sessions: [
      S('Superiores 1', 'Peito · Costas · Ombros · Braços', '55–65 min', [
        ['Supino Reto com Barra', 4, '6–10', 120], ['Remada Curvada com Barra Pronada', 4, '8–10', 120], ['Desenvolvimento com Halteres', 3, '8–12', 90],
        ['Puxada Frontal Pronada', 3, '10–12', 90], ['Rosca Direta com Barra', 3, '10–12', 60], ['Tríceps Pulley (corda)', 3, '10–12', 60]]),
      S('Inferiores 1', 'Quadríceps · Posterior · Panturrilha · Core', '55–65 min', [
        ['Agachamento Livre com Barra', 4, '6–10', 150], ['Levantamento Terra Romeno (Stiff)', 3, '8–10', 120], ['Leg Press 45°', 3, '10–12', 120],
        ['Mesa Flexora (deitado)', 3, '12–15', 60], ['Panturrilha em Pé na Máquina', 4, '12–15', 45], ['Abdominal Infra (elevação de quadril)', 3, '15–20', 45]]),
      S('Superiores 2', 'Peito · Costas · Ombros · Braços', '55–65 min', [
        ['Supino Inclinado com Halteres', 4, '8–12', 90], ['Puxada Pegada Neutra (triângulo)', 4, '8–12', 90], ['Remada Unilateral com Halter (serrote)', 3, '10–12', 60],
        ['Elevação Lateral com Halteres', 4, '12–15', 60], ['Rosca Alternada com Halteres', 3, '10–12', 60], ['Tríceps Francês com Halter', 3, '10–12', 60]]),
      S('Inferiores 2', 'Quadríceps · Glúteos · Posterior · Core', '55–65 min', [
        ['Agachamento Hack (máquina)', 4, '8–12', 120], ['Hip Thrust com Barra', 4, '8–12', 90], ['Agachamento Búlgaro', 3, '10–12', 90],
        ['Cadeira Extensora', 3, '12–15', 60], ['Cadeira Flexora (sentado)', 3, '12–15', 60], ['Panturrilha Sentado', 4, '15–20', 45], ['Prancha Lateral', 3, '30–45', 45]])] },
    { id: 'd6-acad', name: 'Empurrar · Puxar · Pernas 2× · 6 dias · academia', days: 6, place: 'academia', level: 'normal', sessions: [
      Object.assign({}, pushA, { name: 'Peito, ombros e tríceps A' }), Object.assign({}, pullA, { name: 'Costas e bíceps A' }), Object.assign({}, legsA, { name: 'Pernas e abdômen A' }),
      S('Peito, ombros e tríceps B', 'Peito · Ombros · Tríceps', '55–65 min', [
        ['Supino Inclinado com Barra', 4, '8–12', 120], ['Chest Press (máquina)', 3, '10–12', 90], ['Arnold Press', 3, '10–12', 90],
        ['Elevação Lateral na Polia', 3, '12–15', 60], ['Crucifixo na Máquina (Peck Deck)', 3, '12–15', 60], ['Tríceps Testa com Barra EZ', 3, '10–12', 60]]),
      S('Costas e bíceps B', 'Costas · Bíceps · Ombro posterior', '55–65 min', [
        ['Barra Fixa Pronada', 4, '6–10', 120], ['Remada Cavalinho (T-bar)', 4, '8–12', 90], ['Puxada Unilateral na Polia', 3, '10–12', 60],
        ['Crucifixo Inverso com Halteres', 3, '12–15', 60], ['Rosca Scott com Barra EZ', 3, '10–12', 60], ['Rosca Martelo na Polia (corda)', 3, '12–15', 60]]),
      S('Pernas e abdômen B', 'Glúteos · Posterior · Quadríceps · Core', '60–70 min', [
        ['Agachamento no Smith', 4, '8–12', 120], ['Hip Thrust com Barra', 4, '8–12', 90], ['Stiff com Halteres', 3, '10–12', 90],
        ['Avanço (passada) com Halteres', 3, '10–12', 90], ['Cadeira Flexora (sentado)', 3, '12–15', 60], ['Panturrilha Sentado', 4, '15–20', 45], ['Abdominal na Polia (crunch ajoelhado)', 3, '12–15', 45]])] },
    // ---------- academia · iniciante (máquinas e movimentos simples) ----------
    { id: 'd2-acad-ini', name: 'Iniciante corpo todo A/B · 2 dias · academia', days: 2, place: 'academia', level: 'iniciante', sessions: [
      S('Corpo todo A', 'Pernas · Peito · Costas · Ombros', '45–55 min', [
        ['Leg Press 45°', 3, '12–15', 90], ['Chest Press (máquina)', 3, '12–15', 90], ['Puxada Frontal Pronada', 3, '12–15', 90],
        ['Cadeira Flexora (sentado)', 3, '12–15', 60], ['Desenvolvimento na Máquina', 3, '12–15', 90], ['Prancha Frontal', 3, '20–30', 45]]),
      S('Corpo todo B', 'Pernas · Costas · Peito · Braços', '45–55 min', [
        ['Agachamento Goblet', 3, '12–15', 90], ['Remada na Máquina Articulada', 3, '12–15', 90], ['Crucifixo na Máquina (Peck Deck)', 3, '12–15', 60],
        ['Cadeira Extensora', 3, '12–15', 60], ['Rosca Direta com Barra EZ', 2, '12–15', 60], ['Tríceps Pulley (barra)', 2, '12–15', 60], ['Elevação Pélvica (glute bridge)', 3, '12–15', 45]])] },
    { id: 'd3-acad-ini', name: 'Iniciante corpo todo A/B/C · 3 dias · academia', days: 3, place: 'academia', level: 'iniciante', sessions: [
      S('Corpo todo A', 'Pernas · Peito · Costas · Ombros', '45–55 min', [
        ['Leg Press 45°', 3, '12–15', 90], ['Chest Press (máquina)', 3, '12–15', 90], ['Puxada Frontal Pronada', 3, '12–15', 90],
        ['Elevação Lateral na Máquina', 2, '12–15', 60], ['Prancha Frontal', 3, '20–30', 45]]),
      S('Corpo todo B', 'Pernas · Costas · Peito · Posterior', '45–55 min', [
        ['Agachamento Goblet', 3, '12–15', 90], ['Remada na Máquina Articulada', 3, '12–15', 90], ['Supino Reto com Halteres', 3, '12–15', 90],
        ['Cadeira Flexora (sentado)', 3, '12–15', 60], ['Abdominal Supra (crunch)', 3, '15–20', 45]]),
      S('Corpo todo C', 'Pernas · Ombros · Costas · Braços', '45–55 min', [
        ['Cadeira Extensora', 3, '12–15', 60], ['Desenvolvimento na Máquina', 3, '12–15', 90], ['Remada Sentada na Polia (triângulo)', 3, '12–15', 90],
        ['Hip Thrust na Máquina', 3, '12–15', 60], ['Rosca Direta com Barra EZ', 2, '12–15', 60], ['Tríceps Pulley (barra)', 2, '12–15', 60], ['Dead Bug', 3, '10–12', 45]])] },
    { id: 'd4-acad-ini', name: 'Iniciante superiores / inferiores · 4 dias · academia', days: 4, place: 'academia', level: 'iniciante', sessions: [
      S('Superiores 1', 'Peito · Costas · Ombros · Braços', '45–55 min', [
        ['Chest Press (máquina)', 3, '12–15', 90], ['Puxada Frontal Pronada', 3, '12–15', 90], ['Desenvolvimento na Máquina', 3, '12–15', 90],
        ['Remada na Máquina Articulada', 3, '12–15', 90], ['Rosca Scott na Máquina', 2, '12–15', 60], ['Tríceps na Máquina', 2, '12–15', 60]]),
      S('Inferiores 1', 'Quadríceps · Posterior · Glúteos · Core', '45–55 min', [
        ['Leg Press 45°', 3, '12–15', 90], ['Cadeira Extensora', 3, '12–15', 60], ['Cadeira Flexora (sentado)', 3, '12–15', 60],
        ['Hip Thrust na Máquina', 3, '12–15', 60], ['Panturrilha Sentado', 3, '15–20', 45], ['Prancha Frontal', 3, '20–30', 45]]),
      S('Superiores 2', 'Peito · Costas · Ombros · Braços', '45–55 min', [
        ['Crucifixo na Máquina (Peck Deck)', 3, '12–15', 60], ['Puxada Pegada Neutra (triângulo)', 3, '12–15', 90], ['Elevação Lateral na Máquina', 3, '12–15', 60],
        ['Remada Sentada na Polia (triângulo)', 3, '12–15', 90], ['Rosca Direta com Barra EZ', 2, '12–15', 60], ['Tríceps Pulley (barra)', 2, '12–15', 60]]),
      S('Inferiores 2', 'Quadríceps · Glúteos · Adutores · Core', '45–55 min', [
        ['Agachamento Goblet', 3, '12–15', 90], ['Mesa Flexora (deitado)', 3, '12–15', 60], ['Abdução de Quadril na Máquina', 3, '15–20', 60],
        ['Adução na Máquina (cadeira adutora)', 3, '15–20', 60], ['Panturrilha em Pé na Máquina', 3, '15–20', 45], ['Dead Bug', 3, '10–12', 45]])] },
    // ---------- CASA ----------
    { id: 'd2-casa', name: 'Corpo todo A/B · 2 dias · casa', days: 2, place: 'casa', level: 'normal', sessions: [
      S('Corpo todo A', 'Pernas · Peito · Costas · Ombros', '45–55 min', [
        ['Agachamento Goblet', 4, '10–15', 90], ['Flexão de Braço', 4, '8–15', 90], ['Remada Unilateral com Halter (serrote)', 4, '10–12', 60],
        ['Stiff com Halteres', 3, '10–12', 90], ['Desenvolvimento com Halteres', 3, '10–12', 90], ['Rosca Alternada com Halteres', 3, '10–12', 60], ['Prancha Frontal', 3, '30–60', 45]]),
      S('Corpo todo B', 'Pernas · Glúteos · Peito · Costas', '45–55 min', [
        ['Agachamento Búlgaro', 3, '10–12', 90], ['Elevação Pélvica Unilateral', 3, '12–15', 60], ['Supino Reto com Halteres', 3, '10–12', 90],
        ['Remada Curvada com Halteres', 4, '10–12', 60], ['Elevação Lateral com Halteres', 3, '12–15', 60], ['Tríceps Francês com Halter', 3, '10–12', 60], ['Abdominal Bicicleta', 3, '15–20', 45]])] },
    { id: 'd3-casa', name: 'Empurrar · Puxar · Pernas · 3 dias · casa', days: 3, place: 'casa', level: 'normal', sessions: [cPush, cPull, cLegs] },
    { id: 'd4-casa', name: 'Superiores / Inferiores · 4 dias · casa', days: 4, place: 'casa', level: 'normal', sessions: [
      S('Superiores 1', 'Peito · Costas · Ombros · Braços', '45–55 min', [
        ['Flexão de Braço', 4, '8–15', 90], ['Remada Unilateral com Halter (serrote)', 4, '10–12', 60], ['Desenvolvimento com Halteres', 3, '10–12', 90],
        ['Pullover com Halter', 3, '12–15', 60], ['Rosca Alternada com Halteres', 3, '10–12', 60], ['Tríceps Francês com Halter', 3, '10–12', 60]]),
      S('Inferiores 1', 'Quadríceps · Posterior · Glúteos · Core', '45–55 min', [
        ['Agachamento Goblet', 4, '10–15', 90], ['Stiff com Halteres', 4, '10–12', 90], ['Avanço (passada) com Halteres', 3, '10–12', 90],
        ['Elevação Pélvica Unilateral', 3, '12–15', 60], ['Panturrilha no Degrau (peso corporal)', 4, '15–20', 45], ['Prancha Frontal', 3, '30–60', 45]]),
      S('Superiores 2', 'Peito · Costas · Ombros · Braços', '45–55 min', [
        ['Supino Reto com Halteres', 4, '10–12', 90], ['Remada Curvada com Halteres', 4, '10–12', 60], ['Elevação Lateral com Halteres', 4, '12–15', 60],
        ['Crucifixo Inverso com Halteres', 3, '12–15', 60], ['Rosca Martelo', 3, '12–15', 60], ['Flexão Diamante', 3, '8–12', 60]]),
      S('Inferiores 2', 'Quadríceps · Glúteos · Adutores · Core', '45–55 min', [
        ['Agachamento Búlgaro', 4, '10–12', 90], ['Step-up no Banco', 3, '10–12', 60], ['Elevação Pélvica (glute bridge)', 4, '15–20', 60],
        ['Agachamento Sumô com Halter', 3, '12–15', 60], ['Panturrilha Unilateral com Halter', 3, '12–15', 45], ['Abdominal Bicicleta', 3, '15–20', 45], ['Dead Bug', 3, '10–12', 45]])] },
    { id: 'd6-casa', name: 'Empurrar · Puxar · Pernas 2× · 6 dias · casa', days: 6, place: 'casa', level: 'normal', sessions: [
      Object.assign({}, cPush, { name: 'Peito, ombros e tríceps A' }), Object.assign({}, cPull, { name: 'Costas e bíceps A' }), Object.assign({}, cLegs, { name: 'Pernas e abdômen A' }),
      S('Peito, ombros e tríceps B', 'Peito · Ombros · Tríceps', '45–55 min', [
        ['Flexão Declinada', 4, '8–12', 90], ['Arnold Press', 3, '10–12', 90], ['Crucifixo Reto com Halteres', 3, '12–15', 60],
        ['Elevação Lateral com Halteres', 3, '12–15', 60], ['Mergulho no Banco', 3, '10–15', 60], ['Tríceps Coice (kickback)', 3, '12–15', 45]]),
      S('Costas e bíceps B', 'Costas · Trapézio · Bíceps', '45–55 min', [
        ['Remada Curvada com Halteres', 4, '10–12', 60], ['Remada Unilateral com Halter (serrote)', 3, '10–12', 60], ['Crucifixo Inverso com Halteres', 3, '12–15', 60],
        ['Encolhimento com Halteres', 3, '12–15', 60], ['Rosca Concentrada', 3, '10–12', 60], ['Rosca Simultânea com Halteres', 3, '10–12', 60], ['Superman (extensão lombar no solo)', 3, '12–15', 45]]),
      S('Pernas e abdômen B', 'Glúteos · Posterior · Quadríceps · Core', '50–60 min', [
        ['Agachamento Búlgaro', 4, '10–12', 90], ['Stiff com Halteres', 4, '10–12', 90], ['Agachamento Sumô com Halter', 3, '12–15', 60],
        ['Step-up no Banco', 3, '10–12', 60], ['Elevação Pélvica Unilateral', 3, '12–15', 60], ['Panturrilha no Degrau (peso corporal)', 4, '15–20', 45], ['Mountain Climber (escalador)', 3, '30–45', 45]])] },
    // ---------- casa · iniciante ----------
    { id: 'd2-casa-ini', name: 'Iniciante corpo todo A/B · 2 dias · casa', days: 2, place: 'casa', level: 'iniciante', sessions: [
      S('Corpo todo A', 'Pernas · Peito · Costas · Core', '35–45 min', [
        ['Agachamento com Peso Corporal', 3, '12–15', 60], ['Flexão Inclinada', 3, '8–12', 60], ['Remada Unilateral com Halter (serrote)', 3, '12–15', 60],
        ['Elevação Pélvica (glute bridge)', 3, '12–15', 60], ['Desenvolvimento com Halteres', 2, '12–15', 60], ['Prancha Frontal', 3, '20–30', 45]]),
      S('Corpo todo B', 'Pernas · Peito · Costas · Core', '35–45 min', [
        ['Agachamento Goblet', 3, '12–15', 60], ['Supino Reto com Halteres', 3, '12–15', 60], ['Remada Curvada com Halteres', 3, '12–15', 60],
        ['Afundo Estático', 2, '10–12', 60], ['Elevação Lateral com Halteres', 2, '12–15', 60], ['Bird Dog (perdigueiro)', 3, '10–12', 45]])] },
    { id: 'd3-casa-ini', name: 'Iniciante corpo todo A/B/C · 3 dias · casa', days: 3, place: 'casa', level: 'iniciante', sessions: [
      S('Corpo todo A', 'Pernas · Peito · Costas · Core', '35–45 min', [
        ['Agachamento com Peso Corporal', 3, '12–15', 60], ['Flexão Inclinada', 3, '8–12', 60], ['Remada Unilateral com Halter (serrote)', 3, '12–15', 60],
        ['Elevação Pélvica (glute bridge)', 3, '12–15', 60], ['Prancha Frontal', 3, '20–30', 45]]),
      S('Corpo todo B', 'Pernas · Peito · Costas · Core', '35–45 min', [
        ['Agachamento Goblet', 3, '12–15', 60], ['Supino Reto com Halteres', 3, '12–15', 60], ['Remada Curvada com Halteres', 3, '12–15', 60],
        ['Panturrilha no Degrau (peso corporal)', 3, '15–20', 45], ['Dead Bug', 3, '10–12', 45]]),
      S('Corpo todo C', 'Pernas · Ombros · Costas · Braços', '35–45 min', [
        ['Afundo Estático', 3, '10–12', 60], ['Desenvolvimento com Halteres', 3, '12–15', 60], ['Pullover com Halter', 3, '12–15', 60],
        ['Rosca Alternada com Halteres', 2, '12–15', 60], ['Bird Dog (perdigueiro)', 3, '10–12', 45]])] },
    { id: 'd4-casa-ini', name: 'Iniciante superiores / inferiores · 4 dias · casa', days: 4, place: 'casa', level: 'iniciante', sessions: [
      S('Superiores 1', 'Peito · Costas · Ombros · Braços', '35–45 min', [
        ['Flexão Inclinada', 3, '8–12', 60], ['Remada Unilateral com Halter (serrote)', 3, '12–15', 60], ['Desenvolvimento com Halteres', 3, '12–15', 60],
        ['Rosca Alternada com Halteres', 2, '12–15', 60], ['Tríceps Francês com Halter', 2, '12–15', 60]]),
      S('Inferiores 1', 'Quadríceps · Glúteos · Core', '35–45 min', [
        ['Agachamento com Peso Corporal', 3, '12–15', 60], ['Elevação Pélvica (glute bridge)', 3, '12–15', 60], ['Afundo Estático', 3, '10–12', 60],
        ['Panturrilha no Degrau (peso corporal)', 3, '15–20', 45], ['Prancha Frontal', 3, '20–30', 45]]),
      S('Superiores 2', 'Peito · Costas · Ombros · Braços', '35–45 min', [
        ['Supino Reto com Halteres', 3, '12–15', 60], ['Remada Curvada com Halteres', 3, '12–15', 60], ['Elevação Lateral com Halteres', 3, '12–15', 60],
        ['Rosca Martelo', 2, '12–15', 60], ['Mergulho no Banco', 2, '8–12', 60]]),
      S('Inferiores 2', 'Quadríceps · Posterior · Core', '35–45 min', [
        ['Agachamento Goblet', 3, '12–15', 60], ['Stiff com Halteres', 3, '12–15', 60], ['Step-up no Banco', 3, '10–12', 60],
        ['Superman (extensão lombar no solo)', 3, '12–15', 45], ['Dead Bug', 3, '10–12', 45]])] }
  ];

  // Objetivo: aplicado por cima do modelo ao criar o plano.
  const GOALS = {
    massa: { name: 'Ganhar massa muscular', period: 'hip12' },
    gordura: { name: 'Perder gordura', period: 'lin8', reps: '12–15', restMax: 60, cardio: '15–20 min de cardio leve (zona 2) no final' },
    saude: { name: 'Saúde e condicionamento', period: 'man4', reps: '10–15', setsMax: 3, restMin: 60, restMax: 90 },
    iniciante: { name: 'Estou começando agora', period: 'ini4', reps: '12–15', setsMax: 3, restMin: 60, restMax: 90, rir: 'RIR 3' }
  };
  w.MODELOS = { list, GOALS };
})(window);
