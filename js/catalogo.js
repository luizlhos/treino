/* ===== Banco de exercícios =====  Nome|categoria|grupo|equipamento|tipo
   categoria: M=Musculação C=Cardio K=Core X=Crossfit · tipo: L=carga×reps B=peso corporal T=tempo A=cardio W=WOD */
const CATALOG_RAW=`Supino Reto com Barra|M|Peito|Barra|L
Supino Reto com Halteres|M|Peito|Halteres|L
Supino Inclinado com Barra|M|Peito|Barra|L
Supino Inclinado com Halteres|M|Peito|Halteres|L
Supino Declinado com Barra|M|Peito|Barra|L
Supino Declinado com Halteres|M|Peito|Halteres|L
Supino Reto no Smith|M|Peito|Smith|L
Supino Inclinado no Smith|M|Peito|Smith|L
Chest Press (máquina)|M|Peito|Máquina|L
Chest Press Inclinado (máquina)|M|Peito|Máquina|L
Crucifixo Reto com Halteres|M|Peito|Halteres|L
Crucifixo Inclinado com Halteres|M|Peito|Halteres|L
Crucifixo na Máquina (Peck Deck)|M|Peito|Máquina|L
Crossover Polia Alta|M|Peito|Polia|L
Crossover Polia Média|M|Peito|Polia|L
Crossover Polia Baixa|M|Peito|Polia|L
Flexão de Braço|M|Peito|Peso corporal|B
Flexão Inclinada|M|Peito|Peso corporal|B
Flexão Declinada|M|Peito|Peso corporal|B
Flexão Diamante|M|Tríceps|Peso corporal|B
Paralelas (Mergulho) para Peito|M|Peito|Peso corporal|B
Pullover com Halter|M|Peito|Halteres|L
Supino Pegada Fechada|M|Tríceps|Barra|L
Barra Fixa Pronada|M|Costas|Peso corporal|B
Barra Fixa Supinada (Chin-up)|M|Costas|Peso corporal|B
Barra Fixa Pegada Neutra|M|Costas|Peso corporal|B
Barra Fixa com Carga|M|Costas|Peso corporal|L
Barra Fixa Assistida (máquina)|M|Costas|Máquina|L
Puxada Frontal Pronada|M|Costas|Polia|L
Puxada Frontal Supinada|M|Costas|Polia|L
Puxada Pegada Neutra (triângulo)|M|Costas|Polia|L
Puxada Unilateral na Polia|M|Costas|Polia|L
Pulldown com Corda (braços estendidos)|M|Costas|Polia|L
Remada Curvada com Barra Pronada|M|Costas|Barra|L
Remada Curvada com Barra Supinada|M|Costas|Barra|L
Remada Pendlay|M|Costas|Barra|L
Remada Unilateral com Halter (serrote)|M|Costas|Halteres|L
Remada Curvada com Halteres|M|Costas|Halteres|L
Remada Cavalinho (T-bar)|M|Costas|Barra|L
Remada Cavalinho na Máquina|M|Costas|Máquina|L
Remada Sentada na Polia (triângulo)|M|Costas|Polia|L
Remada Sentada Pegada Aberta|M|Costas|Polia|L
Remada na Máquina Articulada|M|Costas|Máquina|L
Remada Baixa Unilateral na Polia|M|Costas|Polia|L
Remada Invertida (australiana)|M|Costas|Peso corporal|B
Remada Seal com Halteres|M|Costas|Halteres|L
Levantamento Terra Convencional|M|Posterior|Barra|L
Levantamento Terra Sumô|M|Glúteos|Barra|L
Levantamento Terra Romeno (Stiff)|M|Posterior|Barra|L
Stiff com Halteres|M|Posterior|Halteres|L
Rack Pull|M|Costas|Barra|L
Good Morning|M|Posterior|Barra|L
Hiperextensão Lombar (banco romano)|M|Costas|Peso corporal|B
Encolhimento com Barra|M|Trapézio|Barra|L
Encolhimento com Halteres|M|Trapézio|Halteres|L
Encolhimento no Smith|M|Trapézio|Smith|L
Desenvolvimento com Barra (militar)|M|Ombros|Barra|L
Desenvolvimento com Halteres|M|Ombros|Halteres|L
Desenvolvimento na Máquina|M|Ombros|Máquina|L
Desenvolvimento no Smith|M|Ombros|Smith|L
Arnold Press|M|Ombros|Halteres|L
Push Press|M|Ombros|Barra|L
Elevação Lateral com Halteres|M|Ombros|Halteres|L
Elevação Lateral na Polia|M|Ombros|Polia|L
Elevação Lateral na Máquina|M|Ombros|Máquina|L
Elevação Lateral Inclinada (deitado de lado)|M|Ombros|Halteres|L
Elevação Frontal com Halteres|M|Ombros|Halteres|L
Elevação Frontal com Anilha|M|Ombros|Anilha|L
Elevação Frontal na Polia|M|Ombros|Polia|L
Crucifixo Inverso com Halteres|M|Ombros|Halteres|L
Crucifixo Inverso na Máquina|M|Ombros|Máquina|L
Crucifixo Inverso na Polia|M|Ombros|Polia|L
Face Pull na Polia|M|Ombros|Polia|L
Remada Alta com Barra|M|Ombros|Barra|L
Rotação Externa na Polia|M|Ombros|Polia|L
Rotação Externa com Halter|M|Ombros|Halteres|L
Y-Raise no Banco Inclinado|M|Ombros|Halteres|L
Rosca Direta com Barra|M|Bíceps|Barra|L
Rosca Direta com Barra EZ|M|Bíceps|Barra EZ|L
Rosca Alternada com Halteres|M|Bíceps|Halteres|L
Rosca Simultânea com Halteres|M|Bíceps|Halteres|L
Rosca Martelo|M|Bíceps|Halteres|L
Rosca Martelo na Polia (corda)|M|Bíceps|Polia|L
Rosca Inclinada com Halteres|M|Bíceps|Halteres|L
Rosca Scott com Barra EZ|M|Bíceps|Barra EZ|L
Rosca Scott na Máquina|M|Bíceps|Máquina|L
Rosca Scott Unilateral com Halter|M|Bíceps|Halteres|L
Rosca Concentrada|M|Bíceps|Halteres|L
Rosca na Polia Baixa|M|Bíceps|Polia|L
Rosca Bayesian (polia por trás)|M|Bíceps|Polia|L
Rosca Spider|M|Bíceps|Barra EZ|L
Rosca 21|M|Bíceps|Barra|L
Rosca Inversa|M|Antebraço|Barra|L
Rosca de Punho|M|Antebraço|Barra|L
Rosca de Punho Inversa|M|Antebraço|Barra|L
Farmer's Walk (caminhada do fazendeiro)|M|Antebraço|Halteres|T
Suspensão na Barra (dead hang)|M|Antebraço|Peso corporal|T
Tríceps Testa com Barra EZ|M|Tríceps|Barra EZ|L
Tríceps Testa com Halteres|M|Tríceps|Halteres|L
Tríceps Pulley (barra)|M|Tríceps|Polia|L
Tríceps Pulley (corda)|M|Tríceps|Polia|L
Tríceps Pulley Inverso|M|Tríceps|Polia|L
Tríceps Francês com Halter|M|Tríceps|Halteres|L
Tríceps Francês Unilateral|M|Tríceps|Halteres|L
Tríceps Francês na Polia (overhead)|M|Tríceps|Polia|L
Tríceps Coice (kickback)|M|Tríceps|Halteres|L
Tríceps Coice na Polia|M|Tríceps|Polia|L
Mergulho no Banco|M|Tríceps|Peso corporal|B
Paralelas para Tríceps|M|Tríceps|Peso corporal|B
Tríceps na Máquina|M|Tríceps|Máquina|L
JM Press|M|Tríceps|Barra|L
Agachamento Livre com Barra|M|Quadríceps|Barra|L
Agachamento Frontal|M|Quadríceps|Barra|L
Agachamento no Smith|M|Quadríceps|Smith|L
Agachamento Goblet|M|Quadríceps|Halteres|L
Agachamento Hack (máquina)|M|Quadríceps|Máquina|L
Agachamento Pêndulo|M|Quadríceps|Máquina|L
Agachamento Búlgaro|M|Quadríceps|Halteres|L
Agachamento Sumô com Halter|M|Glúteos|Halteres|L
Agachamento com Peso Corporal|M|Quadríceps|Peso corporal|B
Agachamento Sissy|M|Quadríceps|Peso corporal|B
Leg Press 45°|M|Quadríceps|Máquina|L
Leg Press Horizontal|M|Quadríceps|Máquina|L
Leg Press Unilateral|M|Quadríceps|Máquina|L
Cadeira Extensora|M|Quadríceps|Máquina|L
Cadeira Extensora Unilateral|M|Quadríceps|Máquina|L
Avanço (passada) com Halteres|M|Quadríceps|Halteres|L
Avanço com Barra|M|Quadríceps|Barra|L
Afundo Estático|M|Quadríceps|Halteres|L
Passada Reversa|M|Glúteos|Halteres|L
Step-up no Banco|M|Quadríceps|Halteres|L
Mesa Flexora (deitado)|M|Posterior|Máquina|L
Cadeira Flexora (sentado)|M|Posterior|Máquina|L
Flexora em Pé Unilateral|M|Posterior|Máquina|L
Nordic Curl (flexão nórdica)|M|Posterior|Peso corporal|B
Flexão de Joelho na Bola Suíça|M|Posterior|Bola|B
Hip Thrust com Barra|M|Glúteos|Barra|L
Hip Thrust na Máquina|M|Glúteos|Máquina|L
Elevação Pélvica (glute bridge)|M|Glúteos|Peso corporal|B
Elevação Pélvica Unilateral|M|Glúteos|Peso corporal|B
Glúteo na Polia (coice)|M|Glúteos|Polia|L
Glúteo na Máquina (coice)|M|Glúteos|Máquina|L
Abdução de Quadril na Máquina|M|Glúteos|Máquina|L
Abdução na Polia|M|Glúteos|Polia|L
Abdução com Elástico (andar lateral)|M|Glúteos|Elástico|B
Adução na Máquina (cadeira adutora)|M|Adutores|Máquina|L
Adução na Polia|M|Adutores|Polia|L
Pull-through na Polia|M|Glúteos|Polia|L
Kettlebell Swing (musculação)|M|Glúteos|Kettlebell|L
Panturrilha em Pé na Máquina|M|Panturrilha|Máquina|L
Panturrilha Sentado|M|Panturrilha|Máquina|L
Panturrilha no Leg Press|M|Panturrilha|Máquina|L
Panturrilha no Smith|M|Panturrilha|Smith|L
Panturrilha Unilateral com Halter|M|Panturrilha|Halteres|L
Panturrilha no Degrau (peso corporal)|M|Panturrilha|Peso corporal|B
Tibial Anterior (elevação de ponta de pé)|M|Panturrilha|Peso corporal|B
Clean com Halteres|M|Corpo inteiro|Halteres|L
Thruster com Halteres|M|Corpo inteiro|Halteres|L
Esteira — caminhada|C|Cardio|Esteira|A
Esteira — corrida|C|Cardio|Esteira|A
Esteira — caminhada inclinada|C|Cardio|Esteira|A
Esteira — tiros (intervalado)|C|Cardio|Esteira|A
Corrida na rua|C|Cardio|Ao ar livre|A
Corrida — intervalado (tiros)|C|Cardio|Ao ar livre|A
Caminhada ao ar livre|C|Cardio|Ao ar livre|A
Trilha / Hiking|C|Cardio|Ao ar livre|A
Bicicleta ergométrica|C|Cardio|Bicicleta|A
Bicicleta horizontal|C|Cardio|Bicicleta|A
Spinning / Bike indoor|C|Cardio|Bicicleta|A
Ciclismo na rua|C|Cardio|Bicicleta|A
Air Bike (Assault Bike)|C|Cardio|Air bike|A
Elíptico (transport)|C|Cardio|Elíptico|A
Escada (stair climber)|C|Cardio|Escada|A
Simulador de escada (step)|C|Cardio|Máquina|A
Remo ergômetro|C|Cardio|Remo|A
Ski Erg|C|Cardio|Ski Erg|A
Natação — livre|C|Cardio|Piscina|A
Natação — técnica/educativos|C|Cardio|Piscina|A
Hidroginástica|C|Cardio|Piscina|A
Pular corda|C|Cardio|Corda|A
Zona 2 (cardio contínuo leve)|C|Cardio|Qualquer|A
HIIT (intervalado de alta intensidade)|C|Cardio|Qualquer|A
Tabata|C|Cardio|Qualquer|A
Polichinelo|C|Cardio|Peso corporal|A
Dança / Zumba|C|Cardio|Aula|A
Boxe / Muay Thai (saco)|C|Cardio|Saco|A
Futebol / esporte coletivo|C|Cardio|Esporte|A
Beach tennis / tênis|C|Cardio|Esporte|A
Prancha Frontal|K|Core|Peso corporal|T
Prancha Lateral|K|Core|Peso corporal|T
Prancha com Toque no Ombro|K|Core|Peso corporal|B
Prancha Dinâmica (sobe e desce)|K|Core|Peso corporal|B
Prancha com Peso nas Costas|K|Core|Anilha|T
Hollow Hold (canoa)|K|Core|Peso corporal|T
Superman (extensão lombar no solo)|K|Core|Peso corporal|B
Abdominal Supra (crunch)|K|Core|Peso corporal|B
Abdominal Infra (elevação de quadril)|K|Core|Peso corporal|B
Abdominal Bicicleta|K|Core|Peso corporal|B
Abdominal Remador|K|Core|Peso corporal|B
Abdominal Canivete (V-up)|K|Core|Peso corporal|B
Abdominal na Polia (crunch ajoelhado)|K|Core|Polia|L
Abdominal na Máquina|K|Core|Máquina|L
Abdominal Declinado|K|Core|Banco|B
Sit-up|K|Core|Peso corporal|B
Elevação de Pernas Deitado|K|Core|Peso corporal|B
Elevação de Pernas na Barra (hanging leg raise)|K|Core|Barra fixa|B
Elevação de Joelhos na Barra|K|Core|Barra fixa|B
Elevação de Pernas na Paralela (captain's chair)|K|Core|Máquina|B
Toes to Bar (core)|K|Core|Barra fixa|B
Roda Abdominal (ab wheel)|K|Core|Roda|B
Dead Bug|K|Core|Peso corporal|B
Bird Dog (perdigueiro)|K|Core|Peso corporal|B
Pallof Press|K|Core|Polia|L
Woodchopper na Polia (lenhador)|K|Core|Polia|L
Rotação Russa (russian twist)|K|Core|Anilha|B
Mountain Climber (escalador)|K|Core|Peso corporal|B
Abdominal Oblíquo Lateral|K|Core|Peso corporal|B
Inclinação Lateral com Halter|K|Core|Halteres|L
Farmer Carry Unilateral (suitcase carry)|K|Core|Halteres|T
L-Sit|K|Core|Peso corporal|T
Dragon Flag|K|Core|Banco|B
Ab Mat Sit-up|K|Core|Ab mat|B
Prancha no TRX / Body Saw|K|Core|TRX|T
Pike no TRX|K|Core|TRX|B
Stir the Pot (bola suíça)|K|Core|Bola|T
Back Squat|X|Levantamento|Barra|L
Front Squat|X|Levantamento|Barra|L
Overhead Squat|X|Levantamento|Barra|L
Deadlift|X|Levantamento|Barra|L
Sumo Deadlift High Pull|X|Levantamento|Barra|L
Strict Press|X|Levantamento|Barra|L
Push Press (CF)|X|Levantamento|Barra|L
Push Jerk|X|Levantamento|Barra|L
Split Jerk|X|LPO|Barra|L
Clean (power clean)|X|LPO|Barra|L
Squat Clean|X|LPO|Barra|L
Hang Power Clean|X|LPO|Barra|L
Clean and Jerk|X|LPO|Barra|L
Snatch (power snatch)|X|LPO|Barra|L
Squat Snatch|X|LPO|Barra|L
Hang Power Snatch|X|LPO|Barra|L
Thruster|X|Levantamento|Barra|L
Cluster|X|LPO|Barra|L
Wall Ball|X|Metcon|Medicine ball|B
Kettlebell Swing (americano)|X|Metcon|Kettlebell|B
Kettlebell Swing (russo)|X|Metcon|Kettlebell|B
Kettlebell Snatch|X|Metcon|Kettlebell|B
Kettlebell Goblet Squat|X|Metcon|Kettlebell|B
Turkish Get-up|X|Metcon|Kettlebell|B
Dumbbell Snatch|X|Metcon|Halteres|B
Devil Press|X|Metcon|Halteres|B
Man Maker|X|Metcon|Halteres|B
Burpee|X|Ginástica|Peso corporal|B
Burpee Over the Bar|X|Ginástica|Peso corporal|B
Burpee Box Jump Over|X|Ginástica|Caixa|B
Box Jump|X|Ginástica|Caixa|B
Box Step-up|X|Ginástica|Caixa|B
Pull-up Kipping|X|Ginástica|Barra fixa|B
Pull-up Butterfly|X|Ginástica|Barra fixa|B
Chest to Bar|X|Ginástica|Barra fixa|B
Toes to Bar|X|Ginástica|Barra fixa|B
Knees to Elbow|X|Ginástica|Barra fixa|B
Bar Muscle-up|X|Ginástica|Barra fixa|B
Ring Muscle-up|X|Ginástica|Argolas|B
Ring Dip|X|Ginástica|Argolas|B
Ring Row|X|Ginástica|Argolas|B
Handstand Push-up (HSPU)|X|Ginástica|Parede|B
Handstand Walk|X|Ginástica|Peso corporal|B
Handstand Hold|X|Ginástica|Parede|T
Pistol Squat|X|Ginástica|Peso corporal|B
Air Squat|X|Ginástica|Peso corporal|B
Lunges (avanço)|X|Ginástica|Peso corporal|B
Rope Climb (subida na corda)|X|Ginástica|Corda|B
GHD Sit-up|X|Ginástica|GHD|B
Double Under|X|Metcon|Corda|B
Single Under|X|Metcon|Corda|B
Row (remo — calorias/metros)|X|Metcon|Remo|B
Assault Bike (calorias)|X|Metcon|Air bike|B
Ski Erg (calorias/metros)|X|Metcon|Ski Erg|B
Run (corrida — metros)|X|Metcon|Ao ar livre|B
Shuttle Run|X|Metcon|Peso corporal|B
Sled Push (trenó)|X|Metcon|Trenó|B
Sandbag Carry|X|Metcon|Sandbag|B
Wall Walk|X|Ginástica|Parede|B
WOD — AMRAP|X|WOD|Livre|W
WOD — For Time|X|WOD|Livre|W
WOD — EMOM|X|WOD|Livre|W
WOD — Carga máxima (RM)|X|WOD|Livre|W
WOD — Chipper|X|WOD|Livre|W
WOD — Tabata|X|WOD|Livre|W
Benchmark Fran (21-15-9 Thruster 43kg + Pull-up)|X|WOD|Barra|W
Benchmark Cindy (AMRAP 20: 5 pull-up, 10 push-up, 15 air squat)|X|WOD|Peso corporal|W
Benchmark Grace (30 Clean and Jerk 61kg)|X|WOD|Barra|W
Benchmark Helen (3 rounds: 400m, 21 KB swing, 12 pull-up)|X|WOD|Kettlebell|W
Benchmark Murph (1,6km, 100 pull-up, 200 push-up, 300 squat, 1,6km)|X|WOD|Peso corporal|W
Benchmark Karen (150 Wall Ball)|X|WOD|Medicine ball|W
Benchmark Diane (21-15-9 Deadlift 102kg + HSPU)|X|WOD|Barra|W
Benchmark Annie (50-40-30-20-10 Double Under + Sit-up)|X|WOD|Corda|W
Benchmark Isabel (30 Snatch 61kg)|X|WOD|Barra|W
Benchmark Jackie (1000m remo, 50 thruster 20kg, 30 pull-up)|X|WOD|Remo|W`;
const KIND={L:'load',B:'bw',T:'time',A:'cardio',W:'wod'},CATN={M:'Musculação',C:'Cardio',K:'Core',X:'Crossfit'};
const KIND_LABEL={load:'Carga × reps',bw:'Peso corporal (reps)',time:'Tempo (segundos)',cardio:'Cardio (tempo/distância)',wod:'WOD (pontuação)'};
const KIND_ICON={load:'🏋️',bw:'🤸',time:'⏱️',cardio:'🏃',wod:'🔥'};
const CATALOG=CATALOG_RAW.split('\n').map((l,i)=>{const[n,c,g,e,k]=l.split('|');return{id:'c_'+n.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''),name:n,cat:CATN[c],grp:g,eq:e,kind:KIND[k]}});

/* ===== Modelos de treinos (sequências prontas) =====
   Cada exercício: [nome no banco, séries, reps, descanso(seg)] — RIR padrão 2 (core sem RIR). */
const WORKOUT_TEMPLATES={
  hip7:{name:'Hipertrofia PPL 7 treinos · Push A/B, Pull A/B, Legs A/B, Full Body',sessions:[{"name": "Push A", "groups": "Peitoral · Deltóide Ant/Lat · Tríceps", "duration": "85 min", "notes": "Cargas máximas da semana", "cardio": "Zona 2 — 30 min (tarde) · 60–70% FCmax — Após musculação ou separado", "ex": [{"n": "Supino Reto com Barra", "c": "Supino Reto com Barra", "sets": 4, "reps": "6–8", "rir": "RIR 2", "rest": "2–3 min", "restSec": 150, "inc": 2.5, "why": "Maior carga absoluta p/ peitoral; curva de resistência favorável"}, {"n": "Supino Inclinado c/ Halteres", "c": "Supino Inclinado com Halteres", "sets": 3, "reps": "8–10", "rir": "RIR 2", "rest": "90 s", "restSec": 90, "inc": 2.5, "why": "Ênfase em peitoral superior; ROM maior que barra"}, {"n": "Crossover Polia Alta", "c": "Crossover Polia Alta", "sets": 3, "reps": "12–15", "rir": "RIR 2", "rest": "60 s", "restSec": 60, "inc": 1.25, "why": "Resistência máxima no pico — complementa supino"}, {"n": "Desenvolvimento c/ Halteres", "c": "Desenvolvimento com Halteres", "sets": 4, "reps": "8–10", "rir": "RIR 2", "rest": "2 min", "restSec": 120, "inc": 2.5, "why": "Ativação superior de deltóide ant.; amplitude assimétrica"}, {"n": "Elevação Lateral com Cabos", "c": "Elevação Lateral na Polia", "sets": 4, "reps": "12–15", "rir": "RIR 2", "rest": "60 s", "restSec": 60, "inc": 1.25, "why": "Cabo mantém tensão constante no pico"}, {"n": "Tríceps Testa Barra EZ", "c": "Tríceps Testa com Barra EZ", "sets": 3, "reps": "10–12", "rir": "RIR 2", "rest": "90 s", "restSec": 90, "inc": 2.5, "why": "Trabalha tríceps em comprimento — longa porção alongada"}, {"n": "Tríceps Polia (corda)", "c": "Tríceps Pulley (corda)", "sets": 3, "reps": "12–15", "rir": "RIR 2", "rest": "60 s", "restSec": 60, "inc": 1.25, "why": "Finalização em pump; separação enfatiza porção lateral"}]}, {"name": "Pull A", "groups": "Costas · Bíceps · Deltóide Post.", "duration": "85 min", "notes": "Crossfit compatível à tarde", "cardio": "Crossfit (tarde/noite) ✓ · Alta — Perna não foi treinada — seguro", "ex": [{"n": "Barra Fixa com Carga (pronada)", "c": "Barra Fixa com Carga", "sets": 4, "reps": "6–8", "rir": "RIR 2", "rest": "2–3 min", "restSec": 150, "inc": 2.5, "why": "Motor primário para largura dorsal; carga axial ativa redondo"}, {"n": "Remada Curvada Barra Supinada", "c": "Remada Curvada com Barra Supinada", "sets": 4, "reps": "8–10", "rir": "RIR 2", "rest": "2 min", "restSec": 120, "inc": 2.5, "why": "Espessura lombar médio; supinação recruta borda interna"}, {"n": "Remada Unilateral c/ Haltere", "c": "Remada Unilateral com Halter (serrote)", "sets": 3, "reps": "10–12", "rir": "RIR 2", "rest": "60 s", "restSec": 60, "inc": 2.5, "why": "Estabiliza core; permite ROM máximo"}, {"n": "Pulldown Corda Neutro", "c": "Pulldown com Corda (braços estendidos)", "sets": 3, "reps": "12–15", "rir": "RIR 2", "rest": "60 s", "restSec": 60, "inc": 2.5, "why": "Complementar à barra fixa; alongamento controlado"}, {"n": "Crucifixo Inverso na Polia", "c": "Crucifixo Inverso na Polia", "sets": 4, "reps": "15–20", "rir": "RIR 2", "rest": "60 s", "restSec": 60, "inc": 1.25, "why": "Deltóide post. subestimado; tensão em todo o arco"}, {"n": "Rosca Direta Barra EZ", "c": "Rosca Direta com Barra EZ", "sets": 3, "reps": "8–10", "rir": "RIR 2", "rest": "90 s", "restSec": 90, "inc": 2.5, "why": "Carga composta; EZ reduz estresse no punho"}, {"n": "Rosca Inclinada c/ Halteres", "c": "Rosca Inclinada com Halteres", "sets": 3, "reps": "10–12", "rir": "RIR 2", "rest": "60 s", "restSec": 60, "inc": 2.5, "why": "Estica cabeça longa do bíceps → mais fibras ativadas"}]}, {"name": "Legs A", "groups": "Quadríceps · Isquios · Glúteos · Panturr.", "duration": "90 min", "notes": "Sem cardio após — crítico", "cardio": "NADA ← crítico · — — Não comprometer recuperação", "ex": [{"n": "Agachamento Livre com Barra", "c": "Agachamento Livre com Barra", "sets": 4, "reps": "6–8", "rir": "RIR 2", "rest": "3 min", "restSec": 180, "inc": 2.5, "why": "Padrão multi-articular; máximo estímulo hormonal"}, {"n": "Leg Press 45°", "c": "Leg Press 45°", "sets": 4, "reps": "10–12", "rir": "RIR 2", "rest": "2 min", "restSec": 120, "inc": 2.5, "why": "Sobrecarga de volume pós-agachamento; sem demanda lombar"}, {"n": "Cadeira Extensora (full ROM)", "c": "Cadeira Extensora", "sets": 3, "reps": "12–15", "rir": "RIR 2", "rest": "60 s", "restSec": 60, "inc": 2.5, "why": "Isolamento de quad; tensão máxima no pico de extensão"}, {"n": "Stiff / Romanian Deadlift", "c": "Levantamento Terra Romeno (Stiff)", "sets": 4, "reps": "8–10", "rir": "RIR 2", "rest": "2 min", "restSec": 120, "inc": 2.5, "why": "Isquio em comprimento; alto dano mecânico = hipertrofia"}, {"n": "Flexora Deitada", "c": "Mesa Flexora (deitado)", "sets": 3, "reps": "10–12", "rir": "RIR 2", "rest": "90 s", "restSec": 90, "inc": 2.5, "why": "Isolamento complementar isquiotibiais"}, {"n": "Panturrilha em Pé (máquina)", "c": "Panturrilha em Pé na Máquina", "sets": 4, "reps": "12–15", "rir": "RIR 2", "rest": "60 s", "restSec": 60, "inc": 1.25, "why": "Gastrocnêmio bi-articular; joelho estendido = ativação máx."}, {"n": "Panturrilha Sentada (máquina)", "c": "Panturrilha Sentado", "sets": 3, "reps": "15–20", "rir": "RIR 2", "rest": "60 s", "restSec": 60, "inc": 1.25, "why": "Sóleo isolado; joelho flexionado diminui gastrocnêmio"}]}, {"name": "Push B", "groups": "Peitoral · Deltóide · Tríceps (var.)", "duration": "80 min", "notes": "Volume ligeiramente menor", "cardio": "Zona 2 — 30 min (após) · 60–70% FCmax — Imediatamente após a sessão", "ex": [{"n": "Supino Declinado c/ Halteres", "c": "Supino Declinado com Halteres", "sets": 4, "reps": "8–10", "rir": "RIR 2", "rest": "2 min", "restSec": 120, "inc": 2.5, "why": "Fibras inferiores do peitoral; ângulo negativo"}, {"n": "Crucifixo Inclinado c/ Halteres", "c": "Crucifixo Inclinado com Halteres", "sets": 3, "reps": "12–15", "rir": "RIR 2", "rest": "90 s", "restSec": 90, "inc": 1.25, "why": "Tensão no estiramento; maior síntese proteica"}, {"n": "Máquina Chest Press (convergente)", "c": "Chest Press (máquina)", "sets": 3, "reps": "12–15", "rir": "RIR 2", "rest": "60 s", "restSec": 60, "inc": 2.5, "why": "Curva de resistência crescente; segurança para falha"}, {"n": "Arnold Press", "c": "Arnold Press", "sets": 3, "reps": "10–12", "rir": "RIR 2", "rest": "90 s", "restSec": 90, "inc": 2.5, "why": "Rotação int.→ext. recruta todas as 3 cabeças do deltóide"}, {"n": "Elevação Lateral Máquina", "c": "Elevação Lateral na Máquina", "sets": 4, "reps": "15–20", "rir": "RIR 2", "rest": "60 s", "restSec": 60, "inc": 1.25, "why": "Isola deltóide medial sem compensação lombar"}, {"n": "Tríceps Francês Halter (1 mão)", "c": "Tríceps Francês Unilateral", "sets": 3, "reps": "10–12", "rir": "RIR 2", "rest": "90 s", "restSec": 90, "inc": 2.5, "why": "Variante p/ longa porção em amplitude aumentada"}, {"n": "Mergulho no Banco (tríceps)", "c": "Mergulho no Banco", "sets": 3, "reps": "12–15", "rir": "RIR 2", "rest": "60 s", "restSec": 60, "inc": 1.25, "why": "Cotovelos paralelos — menor estresse glenoumeral"}]}, {"name": "Pull B", "groups": "Costas · Bíceps · Rotadores · Face Pull", "duration": "80 min", "notes": "Crossfit compatível à tarde", "cardio": "Crossfit (tarde/noite) ✓ · Alta — Perna não foi treinada — seguro", "ex": [{"n": "Remada Cavalinho na Máquina", "c": "Remada Cavalinho na Máquina", "sets": 4, "reps": "10–12", "rir": "RIR 2", "rest": "2 min", "restSec": 120, "inc": 2.5, "why": "Estabilidade scapular; compressão na adução"}, {"n": "Pulldown Pegada Neutra (V-bar)", "c": "Puxada Pegada Neutra (triângulo)", "sets": 4, "reps": "10–12", "rir": "RIR 2", "rest": "90 s", "restSec": 90, "inc": 2.5, "why": "Pegada neutra reduz tensão no supinador"}, {"n": "Remada Sentada na Polia", "c": "Remada Sentada na Polia (triângulo)", "sets": 3, "reps": "12–15", "rir": "RIR 2", "rest": "60 s", "restSec": 60, "inc": 1.25, "why": "Rotação escapular controlada; contração dos rombóides"}, {"n": "Face Pull na Polia", "c": "Face Pull na Polia", "sets": 4, "reps": "15–20", "rir": "RIR 2", "rest": "60 s", "restSec": 60, "inc": 1.25, "why": "Saúde do ombro; deltóide post. + rotadores externos"}, {"n": "Rosca Martelo c/ Halteres", "c": "Rosca Martelo", "sets": 3, "reps": "10–12", "rir": "RIR 2", "rest": "90 s", "restSec": 90, "inc": 2.5, "why": "Braquiorradial + braquial; grossura do braço"}, {"n": "Rosca Scott c/ Barra EZ", "c": "Rosca Scott com Barra EZ", "sets": 3, "reps": "12–15", "rir": "RIR 2", "rest": "60 s", "restSec": 60, "inc": 2.5, "why": "Cotovelo apoiado elimina momentum; pico de tensão na contração — substitui spider com execução mais acessível"}]}, {"name": "Legs B", "groups": "Glúteos · Isquios · Adutores · Panturr.", "duration": "85 min", "notes": "Volume moderado", "cardio": "Zona 2 leve 20 min (opcional) · 50–60% FCmax — Apenas se bem recuperado", "ex": [{"n": "Levantamento Terra Sumo", "c": "Levantamento Terra Sumô", "sets": 4, "reps": "5–6", "rir": "RIR 2–3", "rest": "3 min", "restSec": 180, "inc": 2.5, "why": "Ênfase glúteo + adutores; alta demanda SNC"}, {"n": "Hip Thrust com Barra", "c": "Hip Thrust com Barra", "sets": 4, "reps": "8–12", "rir": "RIR 2", "rest": "2 min", "restSec": 120, "inc": 2.5, "why": "Glúteo máximo em contração máxima"}, {"n": "Agachamento Hack na Máquina", "c": "Agachamento Hack (máquina)", "sets": 3, "reps": "10–12", "rir": "RIR 2", "rest": "90 s", "restSec": 90, "inc": 2.5, "why": "Quad com joelho anterior; menor demanda de coluna"}, {"n": "Cadeira Flexora Sentado", "c": "Cadeira Flexora (sentado)", "sets": 4, "reps": "10–12", "rir": "RIR 2", "rest": "90 s", "restSec": 90, "inc": 2.5, "why": "Isquio em comprimento máximo; sentado alonga proximal"}, {"n": "Adutor na Máquina", "c": "Adução na Máquina (cadeira adutora)", "sets": 3, "reps": "15–20", "rir": "RIR 2", "rest": "60 s", "restSec": 60, "inc": 1.25, "why": "Adutores = 20% da força no agachamento"}, {"n": "Panturrilha no Leg Press", "c": "Panturrilha no Leg Press", "sets": 4, "reps": "15–20", "rir": "RIR 2", "rest": "60 s", "restSec": 60, "inc": 1.25, "why": "Semi-flexionado recruta sóleo + gastrocnêmio"}]}, {"name": "Full Body", "groups": "Manutenção + Fraquezas · Volume MEV", "duration": "75 min", "notes": "Foco em grupos fracos", "cardio": "Crossfit (tarde) ← se nec. · Alta — Reduzir 1 série em legs da semana", "ex": [{"n": "Agachamento Goblet (haltere)", "c": "Agachamento Goblet", "sets": 3, "reps": "12–15", "rir": "RIR 3", "rest": "90 s", "restSec": 90, "inc": 2.5, "why": "Baixa carga lombar; manutenção quad/glúteo"}, {"n": "Barra Fixa (peso corporal/lastro)", "c": "Barra Fixa Pronada", "sets": 3, "reps": "8–10", "rir": "RIR 3", "rest": "90 s", "restSec": 90, "inc": 2.5, "why": "Manutenção dorsal"}, {"n": "Supino c/ Halteres (moderado)", "c": "Supino Reto com Halteres", "sets": 3, "reps": "10–12", "rir": "RIR 3", "rest": "90 s", "restSec": 90, "inc": 2.5, "why": "Manutenção peitoral"}, {"n": "Face Pull", "c": "Face Pull na Polia", "sets": 3, "reps": "15–20", "rir": "RIR 3", "rest": "60 s", "restSec": 60, "inc": 1.25, "why": "Saúde do ombro — sempre presente"}, {"n": "Elevação Lateral", "c": "Elevação Lateral com Halteres", "sets": 3, "reps": "15–20", "rir": "RIR 3", "rest": "60 s", "restSec": 60, "inc": 1.25, "why": "Deltóide medial — 3× na semana ideal"}, {"n": "Rosca Direta", "c": "Rosca Direta com Barra", "sets": 2, "reps": "12–15", "rir": "RIR 3", "rest": "60 s", "restSec": 60, "inc": 2.5, "why": "Manutenção bíceps"}, {"n": "Tríceps Polia", "c": "Tríceps Pulley (barra)", "sets": 2, "reps": "12–15", "rir": "RIR 3", "rest": "60 s", "restSec": 60, "inc": 1.25, "why": "Manutenção tríceps"}]}]},
  split5:{name:'Split 5 treinos · Peito/Tríceps, Costas/Bíceps, Pernas, Ombros/Abdômen, Full Body',sessions:[
    {name:'Peito e Tríceps',groups:'Peito · Tríceps',duration:'60–70 min',ex:[
      ['Supino Reto com Barra',4,'8–12',120],['Supino Inclinado com Halteres',4,'10–12',90],['Crucifixo na Máquina (Peck Deck)',3,'12–15',60],
      ['Crossover Polia Média',3,'12–15',60],['Tríceps Pulley (corda)',4,'10–12',60],['Tríceps Francês com Halter',3,'10–12',60],['Mergulho no Banco',3,'12–15',60]]},
    {name:'Costas e Bíceps',groups:'Costas · Bíceps',duration:'60–70 min',ex:[
      ['Puxada Frontal Pronada',4,'8–12',90],['Remada Curvada com Barra Pronada',4,'8–12',120],['Remada Sentada na Polia (triângulo)',3,'10–12',90],
      ['Pulldown com Corda (braços estendidos)',3,'12–15',60],['Rosca Direta com Barra',4,'10–12',60],['Rosca Alternada com Halteres',3,'10–12',60],['Rosca Martelo',3,'12–15',60]]},
    {name:'Pernas e Glúteos',groups:'Quadríceps · Posterior · Glúteos · Panturrilha',duration:'70–80 min',ex:[
      ['Agachamento Livre com Barra',4,'8–12',150],['Leg Press 45°',4,'10–12',120],['Cadeira Extensora',3,'12–15',60],['Mesa Flexora (deitado)',3,'12–15',60],
      ['Levantamento Terra Romeno (Stiff)',4,'10–12',120],['Hip Thrust com Barra',4,'10–12',90],['Panturrilha em Pé na Máquina',4,'15–20',45]]},
    {name:'Ombros e Abdômen',groups:'Ombros · Trapézio · Core',duration:'55–65 min',ex:[
      ['Desenvolvimento com Halteres',4,'8–12',90],['Elevação Lateral com Halteres',4,'12–15',60],['Elevação Frontal com Halteres',3,'12–15',60],
      ['Crucifixo Inverso com Halteres',3,'12–15',60],['Encolhimento com Halteres',4,'12–15',60],['Prancha Frontal',3,'30–60',45],['Abdominal Infra (elevação de quadril)',3,'15–20',45]]},
    {name:'Full Body',groups:'Corpo inteiro',duration:'60–70 min',ex:[
      ['Agachamento Livre com Barra',3,'10',120],['Supino Reto com Barra',3,'10',90],['Puxada Frontal Pronada',3,'10',90],['Desenvolvimento com Barra (militar)',3,'10',90],
      ['Levantamento Terra Romeno (Stiff)',3,'10',90],['Rosca Direta com Barra',3,'12',60],['Tríceps Pulley (corda)',3,'12',60],['Abdominal na Máquina',3,'15',45]]},
  ]},
};
function sessionsFromTemplate(key,p){return sessionsFromRaw(WORKOUT_TEMPLATES[key],p)}
function sessionsFromRaw(t,p){if(!t)return[];
  return t.sessions.map(s=>({id:uid36('s'),name:s.name,groups:s.groups,duration:s.duration,notes:s.notes||'',cardio:s.cardio||'',exercises:s.ex.map(x=>{if(!Array.isArray(x)){const c=CATALOG.find(k=>k.name===x.c);if(!c)throw new Error('Exercício não encontrado no banco: '+x.c);const it=makeItem(c,p);Object.assign(it,{name:x.n,sets:x.sets,reps:x.reps,rir:x.rir,rest:x.rest,restSec:x.restSec,inc:x.inc,why:x.why});return it}const[n,sets,reps,rest]=x;{
    const c=CATALOG.find(x=>x.name===n);if(!c)throw new Error('Exercício não encontrado no banco: '+n);const it=makeItem(c,p);
    it.sets=sets;it.reps=reps;it.restSec=rest;it.rest=rest>=120?(rest/60)+' min':rest+' s';it.rir=it.kind==='time'||c.cat==='Core'?'':'RIR 2';return it}})}))}

"use strict";
