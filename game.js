// ============================================================
// DARKSPELL - game.js  (motor del juego)
// Requiere sprites.js cargado antes (define ART, PORT,
// CARD_FRAME, CINE_IMG, MAP_IMG, AVATAR_IMG, LOGO_MAIN, LOGO_SUB).
// ============================================================

// El jefe final usa el token del encapuchado desconocido
TOKEN[25]=TOKEN.unknown;

// Inyecta los íconos de interfaz (UI_ICON) en los <img data-ic> ya presentes en el HTML,
// y expone iconTag() para usarlos en HTML generado dinámicamente por JS.
function applyUIIcons(root){
  (root||document).querySelectorAll('img.ui-ic[data-ic]').forEach(el=>{
    const key=el.dataset.ic;
    if(UI_ICON[key] && el.src!==UI_ICON[key]) el.src=UI_ICON[key];
  });
}
function iconTag(key,size,valign){
  return '<img class="ui-ic" src="'+(UI_ICON[key]||'')+'" style="width:'+(size||16)+'px;height:'+(size||16)+'px;vertical-align:'+(valign!=null?valign:-3)+'px">';
}
document.addEventListener('DOMContentLoaded',()=>applyUIIcons());

// Asignar logos de la pantalla de título desde sprites.js
document.getElementById('logoMainImg').src = LOGO_MAIN;
document.getElementById('logoSubImg').src  = LOGO_SUB;

const FC   = {void:'#9d4edd',fire:'#e85d04',nat:'#52b788',storm:'#4895ef'};
const ELEM_ICON = {void:'🌀',fire:'🔥',nat:'🍃',storm:'⚡'};
const ELEM_ICON_KEY = {void:'icon_void',fire:'icon_fire',nat:'icon_nature',storm:'icon_storm'};
function elemIcon(el, size){
  const key = ELEM_ICON_KEY[el];
  if(!key || typeof UI_ICON === 'undefined' || !UI_ICON[key]) return ELEM_ICON[el]||''; // respaldo si algo falla
  const style = size
    ? 'width:'+size+'px;height:'+size+'px;vertical-align:-2px;object-fit:contain'
    : 'width:94%;height:94%;object-fit:contain'; // sin size: llena el círculo contenedor (insignias)
  return '<img class="ui-ic" data-ic="'+key+'" src="'+UI_ICON[key]+'" style="'+style+'">';
}
const ELEM_NAME = {void:'Vacío',fire:'Fuego',nat:'Naturaleza',storm:'Tormenta'};
const ELEMENTS_LIST = ['fire','storm','nat','void'];
function fmtN(v){ return v>=10 ? 'A' : String(v); }

// ── CARDS ─────────────────────────────────────────────────────
const CARDS=[
  // ── EXPANSIÓN II: 49 cartas nuevas (pliego v5) ──────────────
  // ★1 — comunes
  {id:'ap_herrero',       name:'Aprendiz Herrero',     art:'ap_herrero',       f:'fire', st:1,neutral:true,stats:[3,3,2,3],  lore:'Sus manos no queman. Todavía no sabe por qué. Inmune al terreno.'},
  {id:'vigia_torre',      name:'Vigía de Torre',       art:'vigia_torre',      f:'storm',st:1,neutral:true,stats:[2,3,3,3],  lore:'Su cuerno suena solo cuando la tormenta trae algo más. Inmune al terreno.'},
  {id:'curandera_ald',    name:'Curandera de Aldea',   art:'curandera_ald',    f:'nat',  st:1,neutral:true,stats:[3,2,3,3],  lore:'Las hierbas brillan cuando ella las toca. Nunca antes. Inmune al terreno.'},
  {id:'enterrador_noc',   name:'Enterrador Nocturno',  art:'enterrador_noc',   f:'void', st:1,neutral:true,stats:[3,3,3,2],  lore:'Su farol violeta ilumina cosas que ya no deberían moverse. Inmune al terreno.'},
  {id:'panadero_brasas',  name:'Panadero de Brasas',   art:'panadero_brasas',  f:'fire', st:1,stats:[3,2,3,3],  lore:'Carga su horno a la espalda. El pan nunca se enfría.'},
  {id:'marinero_rayos',   name:'Marinero de los Rayos',art:'marinero_rayos',   f:'storm',st:1,stats:[3,3,2,3],  lore:'Sus tatuajes se mueven cuando se acerca una tormenta.'},
  {id:'jardinera_real',   name:'Jardinera Real',       art:'jardinera_real',   f:'nat',  st:1,stats:[2,3,3,3],  lore:'Sus enredaderas crecen al ritmo exacto de su respiración.'},
  {id:'sepulturero_pal',  name:'Sepulturero Pálido',   art:'sepulturero_pal',  f:'void', st:1,stats:[3,3,2,3],  lore:'Habla con las sombras de las tumbas. Ellas le contestan.'},
  {id:'fundidor_metal',   name:'Fundidor de Metales',  art:'fundidor_metal',   f:'fire', st:1,stats:[2,3,3,3],  lore:'Su crisol nunca se apaga, ni siquiera bajo la lluvia.'},
  {id:'timonel_fantasma', name:'Timonel Fantasma',     art:'timonel_fantasma', f:'void', st:1,stats:[3,2,3,3],  lore:'Su bote zarpó hace un siglo. Todavía no llega a ningún puerto.'},
  // ★2 — poco comunes
  {id:'alquimista_fuego',   name:'Alquimista del Fuego',    art:'alquimista_fuego',   f:'fire', st:2,stats:[5,4,4,4],lore:'Sus pociones hierven solas, incluso guardadas en el frío.'},
  {id:'cartografo_tormenta',name:'Cartógrafo de Tormentas', art:'cartografo_tormenta',f:'storm',st:2,stats:[4,5,4,4],lore:'Sus mapas cambian de forma cuando el cielo también cambia.'},
  {id:'apicultor_druida',   name:'Apicultor Druida',        art:'apicultor_druida',   f:'nat',  st:2,stats:[4,4,5,4],lore:'Sus abejas doradas no pican. Iluminan.'},
  {id:'medium_encadenado',  name:'Médium Encadenado',       art:'medium_encadenado',  f:'void', st:2,stats:[4,4,4,5],lore:'Oye voces que nadie más escucha. Ya perdió la cuenta.'},
  {id:'armero_volcanico',   name:'Armero Volcánico',        art:'armero_volcanico',   f:'fire', st:2,stats:[5,4,4,5],lore:'Forja espadas dentro de géiseres. Ninguna se rompe.'},
  {id:'navegante_corriente',name:'Navegante de Corrientes', art:'navegante_corriente',f:'storm',st:2,stats:[4,5,5,4],lore:'Surfea el rayo como si fuera una ola cualquiera.'},
  {id:'guardabosques_cent', name:'Guardabosques Centenario',art:'guardabosques_cent', f:'nat',  st:2,neutral:true,stats:[4,5,4,5],lore:'Un ciervo espectral camina siempre un paso detrás de él. Inmune al terreno.'},
  {id:'coleccionista_masc', name:'Coleccionista de Máscaras',art:'coleccionista_masc',f:'void', st:2,stats:[5,4,5,4],lore:'Cada máscara guarda una vida. Ninguna quiere ser olvidada.'},
  {id:'domador_salam',      name:'Domador de Salamandras',  art:'domador_salam',      f:'fire', st:2,neutral:true,stats:[4,4,5,5],lore:'Su fragua está bajo tierra. Nadie sabe cuán abajo. Inmune al terreno.'},
  {id:'farero_eterno',      name:'Farero de la Tormenta',   art:'farero_eterno',      f:'storm',st:2,neutral:true,stats:[5,5,4,4],lore:'Su luz no guía barcos. Calma tormentas. Inmune al terreno.'},
  // ★3 — raras
  {id:'inquisidora_brasas', name:'Inquisidora de las Brasas', art:'inquisidora_brasas', f:'fire', st:3,stats:[6,7,5,6],lore:'Su armadura está siempre al rojo vivo. Ella ya no lo siente.'},
  {id:'almirante_rayo',     name:'Almirante de la Flota del Rayo',art:'almirante_rayo', f:'storm',st:3,neutral:true,stats:[7,5,6,6],lore:'Su capa chisporrotea con cada paso que da en cubierta. Inmune al terreno.'},
  {id:'arquidruida',        name:'Arquidruida Coronado',      art:'arquidruida',        f:'nat',  st:3,stats:[6,6,6,6],lore:'Su corona florece y se seca según el humor del bosque.'},
  {id:'nigromante_bibl',    name:'Nigromante Bibliotecario',  art:'nigromante_bibl',    f:'void', st:3,stats:[6,5,7,6],lore:'Sus libros flotan y susurran secretos que nadie pidió.'},
  {id:'campeona_gladiadora',name:'Campeona Gladiadora',       art:'campeona_gladiadora',f:'fire', st:3,neutral:true,stats:[7,6,6,5],lore:'Sus guanteletes incendian la arena antes del primer golpe. Inmune al terreno.'},
  {id:'corsaria_cielo',     name:'Corsaria del Cielo',        art:'corsaria_cielo',     f:'storm',st:3,stats:[6,6,5,7],lore:'Su barco vuela entre nubes de tormenta como si fueran olas.'},
  {id:'guardiana_raices',   name:'Guardiana de las Raíces Madre',art:'guardiana_raices',f:'nat',  st:3,stats:[6,7,6,5],lore:'Mitad mujer, mitad árbol. Ya no recuerda cuál fue primero.'},
  {id:'verdugo_mascaras',   name:'Verdugo de las Máscaras',   art:'verdugo_mascaras',   f:'void', st:3,stats:[7,6,5,6],lore:'Su rostro es humo negro. Nadie ha visto lo que hay debajo.'},
  {id:'herrera_legend',     name:'Herrera del Corazón Ardiente',art:'herrera_legend',   f:'fire', st:3,stats:[6,6,7,5],lore:'Forja dentro de un volcán. El volcán nunca se queja.'},
  {id:'capitana_vientos',   name:'Capitana de los Vientos Altos',art:'capitana_vientos', f:'storm',st:3,stats:[5,7,6,6],lore:'Guarda un ciclón entero en la palma de su mano.'},
  // ★4 — épicas
  {id:'senor_forjas',        name:'Señor de las Forjas Eternas',  art:'senor_forjas',        f:'fire', st:4,stats:[8,7,6,7],lore:'Su piel es metal fundido en calma perpetua.'},
  {id:'heraldo_cielos_rotos',name:'Heraldo de los Cielos Rotos',  art:'heraldo_cielos_rotos',f:'storm',st:4,stats:[7,8,7,6],lore:'Mitad hombre, mitad tormenta ya cristalizada.'},
  {id:'madre_estaciones',    name:'Madre de las Estaciones',      art:'madre_estaciones',    f:'nat',  st:4,stats:[7,7,8,6],lore:'Cuatro rostros, una sola voluntad: que el ciclo no se detenga.'},
  {id:'custodio_tumbas',     name:'Custodio de las Tumbas Olvidadas',art:'custodio_tumbas',  f:'void', st:4,neutral:true,stats:[8,6,7,7],lore:'Su corona de huesos pertenece a nombres que ya nadie recuerda. Inmune al terreno.'},
  {id:'titan_cenizas',       name:'Titán de las Cenizas',         art:'titan_cenizas',       f:'fire', st:4,stats:[7,8,6,7],lore:'Gigante hecho de brasas compactadas. Camina, y el suelo arde.'},
  {id:'emperatriz_rayo',     name:'Emperatriz del Rayo Perpetuo', art:'emperatriz_rayo',     f:'storm',st:4,neutral:true,stats:[8,7,7,6],lore:'Su trono flota entre relámpagos que nunca se apagan. Inmune al terreno.'},
  {id:'ancestro_bosque',     name:'Ancestro del Bosque Profundo', art:'ancestro_bosque',     f:'nat',  st:4,stats:[6,8,7,7],lore:'Su rostro está tallado en un roble de mil años.'},
  {id:'archimagister_vacio', name:'Archimagister del Vacío',      art:'archimagister_vacio', f:'void', st:4,stats:[7,7,8,6],lore:'Es una biblioteca viviente de secretos que nadie debería leer.'},
  {id:'fundidor_mundos',     name:'Fundidor de Mundos',           art:'fundidor_mundos',     f:'fire', st:4,stats:[8,6,7,7],lore:'Cada golpe de su martillo crea un volcán nuevo.'},
  {id:'emperador_tempestad', name:'Emperador de las Tempestades', art:'emperador_tempestad', f:'storm',st:4,stats:[7,7,6,8],lore:'Su corona está hecha de nubes con ojos propios.'},
  // ★5 — legendarias
  {id:'corazon_volcan',          name:'Corazón del Volcán Primordial',  art:'corazon_volcan',          f:'fire', st:5,stats:[9,8,8,8],lore:'Lava viva con forma casi humana. Casi.'},
  {id:'tormenta_nunca_termina',  name:'La Tormenta que Nunca Termina',  art:'tormenta_nunca_termina',  f:'storm',st:5,stats:[8,9,8,8],lore:'Empezó antes del primer reino. Nadie sabe cuándo termina.'},
  {id:'arbol_recuerda',          name:'El Árbol que Recuerda Todo',     art:'arbol_recuerda',          f:'nat',  st:5,stats:[8,8,9,8],lore:'Cada anillo de su tronco es un siglo que nadie más recuerda.'},
  {id:'devorador_nombres',       name:'El Devorador de Nombres',        art:'devorador_nombres',       f:'void', st:5,stats:[9,8,8,8],lore:'Toca algo, y ese algo olvida cómo se llamaba.'},
  {id:'ultimo_aliento_sol',      name:'El Último Aliento del Sol',      art:'ultimo_aliento_sol',      f:'fire', st:5,stats:[8,9,8,8],lore:'Un fénix cósmico ardiendo con la luz de un sol que ya no existe.'},
  {id:'trueno_original',         name:'El Trueno Original',             art:'trueno_original',         f:'storm',st:5,stats:[8,8,9,8],lore:'El primer sonido que hizo temblar al mundo. Nunca se fue del todo.'},
  {id:'semilla_mundo',           name:'La Semilla del Mundo',           art:'semilla_mundo',           f:'nat',  st:5,stats:[8,8,8,9],lore:'Dicen que dentro de ella hay universos enteros esperando brotar.'},
  {id:'silencio_vacio',          name:'El Silencio Antes del Vacío',    art:'silencio_vacio',          f:'void', st:5,stats:[9,8,8,8],lore:'No es oscuridad. Es la ausencia de todo lo que pudo haber sido.'},
  {id:'corazon_forjas',          name:'El Corazón de Todas las Forjas', art:'corazon_forjas',          f:'fire', st:5,stats:[8,8,9,8],lore:'El fuego que templó las primeras armas del mundo. Sigue ardiendo.'},
  {id:'shade',     name:'Goblin del Pantano',art:'goblin_pantano',f:'void',st:1,stats:[3,5,4,2],lore:'Pequeño, traicionero y absolutamente impredecible.'},
  {id:'specter',   name:'Espectro Oscuro',   art:'art_specter',      f:'void', st:1,stats:[4,6,5,3],lore:'Nacido en el abismo entre mundos.'},
  {id:'voidwalker',name:'Caminante Vacío',   art:'voidwalker_new',f:'void', st:2,stats:[5,3,6,4],lore:'Atraviesa paredes como si no existieran.'},
  {id:'pyro',      name:'Sid Ionem',          art:'sid_ionem',   f:'fire', st:2,stats:[5,6,4,5],lore:'Forastero de origen desconocido. Su mirada carga el peso de cien batallas.'},
  {id:'sylvan',    name:'Cazadora Sylvan',   art:'sylvan_new',  f:'nat',  st:2,stats:[7,5,3,4],lore:'Cada flecha lleva la voluntad del bosque.'},
  {id:'treefolk',  name:'Guardián Árbol',    art:'treefolk_new',f:'nat',  st:1,stats:[4,3,7,5],lore:'Vive mil años viendo caer imperios.'},
  {id:'berserker', name:'Vak Al Ho',          art:'vak_al_ho',   f:'fire', st:2,stats:[6,8,5,4],lore:'Guerrero orco de las tierras salvajes. Su escudo ha partido más huesos que se puedan contar.'},
  {id:'sombra',    name:'Sombra del Vacío',  art:'sombra_vacio',f:'void', st:3,stats:[7,3,5,8],lore:'Sus ojos violeta atraviesan las almas.'},
  {id:'driada',    name:'Dríada Guardiana',  art:'driada',      f:'nat',  st:3,neutral:true,stats:[6,4,7,8],lore:'Custodia los últimos bosques sagrados. Inmune al terreno.'},
  {id:'guerrero',  name:'Guerrero Infernal', art:'guerrero',    f:'fire', st:3,stats:[4,9,6,2],lore:'Forjado en el núcleo volcánico del mundo.'},
  {id:'warchief',  name:'Jefe de Guerra',    art:'warchief_new',f:'fire', st:3,stats:[8,6,3,5],lore:'Conquista o muere. No hay otra opción.'},
  {id:'lightning', name:'Relámpago Vivo',    art:'lightning_new',f:'storm',st:3,stats:[5,9,3,6],lore:'La electricidad corre por sus venas.'},
  {id:'firelord',  name:'Señor del Fuego',   art:'firelord_new',f:'fire', st:4,neutral:true,stats:[8,10,4,6],lore:'Su corona arde con llama eterna. Inmune al terreno.'},
  {id:'voidlord',  name:'Señor del Vacío',   art:'hero_dark',   f:'void', st:4,stats:[9,4,2,7],lore:'El vacío lo devora todo a su paso.'},
  {id:'dragon',    name:'Dragón del Tormento',art:'dragon',     f:'storm',st:4,stats:[8,7,5,6],lore:'Su rugido convoca la tormenta eterna.'},
  {id:'stormtitan',name:'Titán Tormenta',    art:'art_stormtitan',      f:'storm',st:4,stats:[7,6,8,5],lore:'Nació en el ojo del huracán eterno.'},
  {id:'elfqueen',  name:'Reina Elfa',        art:'hero_elf',    f:'nat',  st:5,stats:[8,7,10,6],lore:'El bosque llora cuando ella avanza a la guerra.'},
  {id:'archon',    name:'Merrik Ionem',       art:'merrik_ionem',f:'void', st:5,stats:[9,7,10,6],lore:'Hermano de Sid Ionem. Sus ojos brillan con la marca de un pacto que jamás debió firmar.'},
  {id:'kraken',    name:'Kraken del Abismo', art:'kraken',      f:'storm',st:5,stats:[10,8,6,7],lore:'Duerme en las profundidades. Siempre hambriento.'},
  {id:'darkspell', name:'El Darkspell',      art:'darkspell',f:'void', st:5,stats:[10,9,9,8],lore:'El hechizo que da nombre a la leyenda.'},
  {id:'familiar',  name:'Aprendiz y Familiar',art:'familiar',   f:'nat',  st:1,stats:[3,2,4,3],lore:'Un pequeño compañero verde que nunca se aleja de su libro.'},
  {id:'aparicion', name:'Aparición Etérea',  art:'aparicion',   f:'void', st:2,neutral:true,stats:[4,3,5,6],lore:'Observa flotas fantasma surcar cielos que ya no existen. Inmune al terreno.'},
  {id:'galeon',    name:'Nila Stingarde',     art:'nila_stingarde',f:'storm',st:2,stats:[5,4,6,3],lore:'Hechicera de los mares del norte. Su sonrisa esconde más trucos que su sombrero.'},
  {id:'runeelf',   name:'Furia Rúnica',      art:'runeelf',     f:'storm',st:3,stats:[6,8,5,6],lore:'Las runas en su rostro arden cuando pierde el control.'},
  {id:'crimsondrag',name:'Dragón Carmesí',   art:'crimsondrag', f:'fire', st:4,stats:[8,9,6,5],lore:'Su aliento de fuego verde corrompe la tierra que toca.'},
  {id:'titancosmico',name:'Titán Cósmico',   art:'titancosmico',f:'void', st:5,stats:[9,8,9,7],lore:'Su corona de espinas perfora la realidad misma.'},
  {id:'leviathan', name:'Leviatán Abisal',   art:'leviathan',   f:'storm',st:5,stats:[10,7,5,8],lore:'Sus fauces pueden tragar barcos enteros sin despertar.'},
  {id:'apocbeast', name:'Devorador de Eras', art:'apocbeast',   f:'void', st:5,stats:[9,10,7,6],lore:'Cada era termina cuando él despierta.'},
  {id:'skullking', name:'Rey de Huesos Eterno',art:'skeletonking',f:'void',st:5,stats:[10,9,8,9],lore:'El trono que ocupa fue forjado con las almas de mil reyes caídos.'},
  // ── NUEVAS CARTAS ★ (st:1) ──────────────────────────────────
  {id:'rata_pantano',  name:'Rata del Pantano',   art:'rata_pantano',f:'nat', st:1,stats:[2,3,2,3],lore:'Pequeña pero venenosa. No subestimes su mordida.'},
  {id:'duende_bosque', name:'Duende del Bosque',  art:'duende_bosque',f:'nat',st:1,stats:[3,2,3,2],lore:'Teje trampas de raíces donde nadie las ve.'},
  {id:'lanzero',       name:'Lanzero de Aldea',   art:'lanzero', f:'fire', st:1,stats:[4,2,2,2],lore:'Primer en atacar, último en retroceder.'},
  {id:'paje_fuego',    name:'Paje del Fuego',     art:'paje_fuego', f:'fire', st:1,stats:[2,4,2,2],lore:'Lleva la antorcha del señor sin titubear.'},
  {id:'centinela',     name:'Centinela Nocturno', art:'centinela', f:'void', st:1,stats:[2,2,4,2],lore:'Patrulla los límites del mundo conocido.'},
  {id:'sombra_menor',  name:'Sombra Menor',       art:'sombra_menor', f:'void', st:1,stats:[2,2,2,4],lore:'Un eco de oscuridad que imita a los vivos.'},
  {id:'chispa',        name:'Chispa Eléctrica',   art:'chispa',      f:'storm',st:1,stats:[3,3,2,2],lore:'Una descarga pequeña puede incendiar un bosque.'},
  {id:'grumete',       name:'Grumete de Tormenta',art:'grumete',f:'storm',st:1,stats:[2,3,3,2],lore:'Aprendió a navegar en las peores tormentas.'},
  {id:'gnomo_runa',    name:'Gnomo Rúnico',       art:'gnomo_runa',f:'storm',st:1,stats:[2,2,3,3],lore:'Sus runas son pequeñas pero sorprendentemente efectivas.'},
  {id:'lobo_gris',     name:'Lobo Gris',          art:'lobo_gris',  f:'nat',  st:1,stats:[4,3,2,1],lore:'Caza en manada, muere en soledad.'},
  {id:'esqueleto',     name:'Esqueleto Errante',  art:'esqueleto', f:'void', st:1,stats:[3,2,3,2],lore:'No recuerda su nombre. Solo recuerda pelear.'},
  {id:'acolito',       name:'Acólito de Ceniza',  art:'acolito', f:'fire', st:1,stats:[2,3,2,3],lore:'Adora el fuego como si fuera un dios vivo.'},
  {id:'poltergeist',   name:'Poltergeist',        art:'poltergeist', f:'void', st:1,stats:[2,2,4,2],lore:'Mueve objetos con rabia acumulada por siglos.'},
  {id:'musgo_vivo',    name:'Musgo Viviente',     art:'musgo_vivo',  f:'nat', st:1,stats:[2,4,2,2],lore:'Crece donde nadie lo espera y asfixia lento.'},
  {id:'chacal_viento', name:'Chacal del Viento',  art:'chacal_viento',f:'storm',st:1,stats:[3,2,2,3],lore:'Corre más rápido que el rayo que lo persigue.'},

  // ── NUEVAS CARTAS ★★ (st:2) ──────────────────────────────────
  {id:'ogro_fango',    name:'Ogro del Fango',     art:'ogro_fango',  f:'nat',  st:2,stats:[6,4,3,3],lore:'Lento, brutal, imparable.'},
  {id:'arquera_elfa',  name:'Arquera Élfica',     art:'arquera_elfa',  f:'nat',  st:2,stats:[4,6,4,3],lore:'Ninguna flecha suya ha errado el blanco.'},
  {id:'escudero_llama',name:'Escudero de Llama',  art:'escudero_llama', f:'fire', st:2,stats:[5,4,4,4],lore:'Su escudo absorbe el calor de sus propias llamas.'},
  {id:'demonio_menor', name:'Demonio Menor',      art:'demonio_menor', f:'void', st:2,stats:[5,5,3,4],lore:'Sirve a amos mayores con dentada sonrisa.'},
  {id:'arpía',         name:'Arpía Tormentosa',   art:'arpia',f:'storm',st:2,stats:[4,5,4,4],lore:'Sus alas generan vendavales con cada aleteo.'},
  {id:'golem_barro',   name:'Gólem de Barro',     art:'golem_barro',  f:'nat',  st:2,stats:[3,4,6,4],lore:'Formado con tierra antigua y voluntad de hierro.'},
  {id:'nigromante',    name:'Nigromante Novato',  art:'nigromante',  f:'void', st:2,stats:[4,5,4,4],lore:'Aún aprende a controlar lo que invoca.'},
  {id:'pirata_maldito',name:'Pirata Maldito',     art:'pirata_maldito',f:'storm',st:2,stats:[5,4,3,5],lore:'Condenado a navegar sin destino ni descanso.'},
  {id:'oso_roca',      name:'Oso de Piedra',      art:'oso_roca',  f:'nat',  st:2,stats:[3,4,5,5],lore:'Su piel es corteza de árbol milenario.'},
  {id:'fantasma_guerra',name:'Fantasma de Guerra',art:'fantasma_guerra', f:'void', st:2,stats:[5,4,4,4],lore:'Repite su última batalla por toda la eternidad.'},
  {id:'jinete_trueno', name:'Jinete del Trueno',  art:'jinete_trueno',f:'storm',st:2,stats:[5,5,4,3],lore:'Cabalga sobre nubes de tormenta cargadas.'},
  {id:'imán_llamas',   name:'Imán de Llamas',     art:'iman_llamas', f:'fire', st:2,stats:[4,6,3,4],lore:'Atrae el fuego enemigo y lo devuelve duplicado.'},
  {id:'espía_sombra',  name:'Espía de las Sombras',art:'espia_sombra',f:'void', st:2,stats:[4,4,4,5],lore:'Sabe todo lo que no deberías contarle a nadie.'},
  {id:'druida_joven',  name:'Druida Joven',       art:'druida_joven',f:'nat', st:2,stats:[4,4,5,4],lore:'Habla con los árboles. A veces le responden.'},
  {id:'canon_magico',  name:'Cañón Mágico',       art:'canon_magico', f:'fire', st:2,stats:[6,5,3,3],lore:'Dispara proyectiles de fuego puro con precisión aterradora.'},
  {id:'medusa_marina', name:'Medusa Marina',      art:'medusa_marina',f:'storm',st:2,stats:[4,4,5,4],lore:'Sus tentáculos pueden paralizar un barco entero.'},
];

// ── TIENDA / PUNTOS MÁGICOS ──────────────────────────────────
// Valor de venta según st (rareza)
const MP_VALUE = {1:5, 2:10, 3:20, 4:40, 5:80};
// Cartas exclusivas de la tienda (no se obtienen en duelos normales)
const SHOP_CARDS = [
  // ── EXPANSIÓN: 29 cartas nuevas (pliego v4) ──
  {id:'salamandra',     name:'Salamandra de Fragua', art:'salamandra',     f:'fire', st:1,stats:[3,3,2,3],lore:'Duerme entre carbones y sueña con volcanes.',                cost:12},
  {id:'anguila',        name:'Anguila Chispeante',   art:'anguila',        f:'storm',st:1,stats:[2,3,3,3],lore:'Nada en el aire cuando la tormenta lo permite.',             cost:12},
  {id:'erizo_espinas',  name:'Erizo de Espinas',     art:'erizo_espinas',  f:'nat',  st:1,stats:[3,2,3,3],lore:'Cada púa es una rama del bosque que lo crió.',               cost:12},
  {id:'polilla_vacio',  name:'Polilla del Vacío',    art:'polilla_vacio',  f:'void', st:1,stats:[3,3,3,2],lore:'Vuela hacia la oscuridad como otras hacia la luz.',          cost:12},
  {id:'herrera',        name:'Herrera de Guerra',    art:'herrera',        f:'fire', st:2,stats:[5,4,4,4],lore:'Forjó la mitad de las espadas del reino. Y las mejores.',    cost:25},
  {id:'sabueso_brasas', name:'Sabueso de Brasas',    art:'sabueso_brasas', f:'fire', st:2,stats:[4,5,4,4],lore:'Su ladrido enciende hogueras a una legua.',                  cost:25},
  {id:'monje_trueno',   name:'Monje del Trueno',     art:'monje_trueno',   f:'storm',st:2,stats:[4,4,5,4],lore:'Medita en el ojo de la tormenta desde hace 40 años.',        cost:25},
  {id:'corsaria_rayo',  name:'Corsaria del Rayo',    art:'corsaria_rayo',  f:'storm',st:2,stats:[5,4,4,5],lore:'Robó un rayo y lo convirtió en su sable.',                   cost:28},
  {id:'chaman_raiz',    name:'Chamán Raíz',          art:'chaman_raiz',    f:'nat',  st:2,stats:[4,4,4,5],lore:'Sus pies echaron raíces hace décadas. No las necesita.',     cost:25},
  {id:'jabali_guerra',  name:'Jabalí de Guerra',     art:'jabali_guerra',  f:'nat',  st:2,stats:[4,5,5,3],lore:'La corteza que lo cubre tiene más batallas que muchos generales.', cost:25},
  {id:'susurrador',     name:'El Susurrador',        art:'susurrador',     f:'void', st:2,stats:[5,5,4,3],lore:'Nadie recuerda qué dijo. Todos recuerdan haberlo escuchado.', cost:28},
  {id:'marioneta',      name:'Marioneta Rota',       art:'marioneta',      f:'void', st:2,stats:[3,5,4,5],lore:'Cortó sus propios hilos. Ahora nadie sabe quién la mueve.',  cost:25},
  {id:'djinn_humo',     name:'Djinn de Humo',        art:'djinn_humo',     f:'fire', st:3,stats:[6,7,5,6],lore:'Concede deseos. Cobra en recuerdos.',                        cost:50},
  {id:'golem_nubes',    name:'Gólem de Nubes',       art:'golem_nubes',    f:'storm',st:3,stats:[5,6,7,6],lore:'Compactó mil tormentas para darse un cuerpo.',               cost:50},
  {id:'sirena_abisal',  name:'Sirena Abisal',        art:'sirena_abisal',  f:'storm',st:3,stats:[7,5,6,6],lore:'Su canto se oye mejor cuando ya es demasiado tarde.',        cost:52},
  {id:'centauro',       name:'Centauro Guardián',    art:'centauro',       f:'nat',  st:3,stats:[6,6,6,6],lore:'Patrulla el mismo sendero desde antes de que existiera.',    cost:50},
  {id:'hongo_anciano',  name:'Hongo Anciano',        art:'hongo_anciano',  f:'nat',  st:3,stats:[5,6,6,7],lore:'Bajo su sombrero cabe un consejo para cada pena.',           cost:50},
  {id:'verdugo_ciego',  name:'Verdugo Ciego',        art:'verdugo_ciego',  f:'void', st:3,stats:[7,6,6,5],lore:'No necesita ver. La culpa hace ruido.',                      cost:52},
  {id:'devorador_rec',  name:'Devorador de Recuerdos',art:'devorador_rec', f:'void', st:3,stats:[6,5,7,6],lore:'Cada luz que traga era el mejor día de alguien.',            cost:52},
  {id:'fenix',          name:'Fénix Renaciente',     art:'fenix',          f:'fire', st:4,stats:[8,7,6,7],lore:'Morir es solo la parte aburrida de su rutina.',              cost:90},
  {id:'coloso_magma',   name:'Coloso de Magma',      art:'coloso_magma',   f:'fire', st:4,stats:[7,8,7,6],lore:'Camina despacio porque el suelo se derrite si corre.',       cost:90},
  {id:'senora_huracan', name:'Señora de los Huracanes',art:'senora_huracan',f:'storm',st:4,stats:[7,7,8,6],lore:'Baila, y las flotas aprenden a rezar.',                     cost:90},
  {id:'behemot_musgo',  name:'Behemot de Musgo',     art:'behemot_musgo',  f:'nat',  st:4,stats:[6,8,7,7],lore:'Un bosque entero decidió caminar. Este fue el resultado.',   cost:90},
  {id:'reina_gusanos',  name:'Reina de las Sombras', art:'reina_gusanos',  f:'void', st:4,stats:[8,6,7,7],lore:'Sus súbditos serpentean por donde la luz no llega.',         cost:95},
  {id:'heraldo_silencio',name:'Heraldo del Silencio',art:'heraldo_silencio',f:'void',st:5,stats:[9,8,8,8],lore:'Donde pisa, hasta los gritos aprenden modales.',             cost:170},
  {id:'avatar_sol',     name:'Avatar del Sol Muerto',art:'avatar_sol',     f:'fire', st:5,stats:[8,9,8,8],lore:'El último dios de un cielo que ya no existe.',               cost:170},
  {id:'ojo_tormenta',   name:'Ojo de la Tormenta Eterna',art:'ojo_tormenta',f:'storm',st:5,neutral:true,stats:[8,8,9,8],lore:'La tormenta no lo tiene: la tormenta ES su párpado. Inmune al terreno.',       cost:170},
  {id:'madre_ciervos',  name:'Madre de los Ciervos', art:'madre_ciervos',  f:'nat',  st:5,stats:[8,8,8,9],lore:'Entre sus astas anidan primaveras que aún no ocurrieron.',   cost:170},
  {id:'primer_susurro', name:'El Primer Susurro',    art:'primer_susurro', f:'void', st:5,stats:[9,9,8,8],lore:'Antes de la luz, algo habló. Esto es lo que dijo.',          cost:190},
  {id:'runemaster', name:'Maestro de Runas',  art:'runemaster_new',f:'storm',st:2,stats:[5,6,4,5],lore:'Sus runas pueden reescribir el destino.',        cost:25},
  {id:'voidspawn',  name:'Engendro del Vacío', art:'art_voidspawn',f:'void', st:2,stats:[6,3,5,4],lore:'Nació en el espacio entre pensamientos.',          cost:25},
  {id:'flamewarden',name:'Guardián de Llamas', art:'art_flamewarden',    f:'fire', st:3,stats:[7,8,5,4],lore:'Juró que el fuego no consumiría el reino.',         cost:50},
  {id:'tidecaller', name:'Invocador de Mareas', art:'art_tidecaller',     f:'storm',st:3,stats:[5,7,8,6],lore:'Habla con el océano en el idioma de las tormentas.',cost:50},
  {id:'sylvanguard', name:'Guardián Silvano',  art:'art_sylvanguard',      f:'nat',  st:3,stats:[6,5,8,7],lore:'El último defensor del bosque ancestral.',          cost:50},
  {id:'soulreaper',  name:'Segador de Almas',  art:'art_soulreaper',   f:'void', st:4,stats:[9,8,5,6],lore:'Cada alma cosechada fortalece su mazo.',             cost:100},
  {id:'stormbringer',name:'Portador de Tormentas',art:'art_stormbringer',   f:'storm',st:4,stats:[8,9,6,7],lore:'La tormenta perfecta vive en sus palmas.',           cost:100},
  {id:'emberlord',   name:'Señor de las Brasas',art:'art_emberlord',f:'fire', st:4,stats:[10,9,5,6],lore:'Convierte ciudades en cenizas con un susurro.',     cost:100},
  {id:'voidheart',   name:'Corazón del Vacío', art:'art_voidheart',   f:'void', st:5,neutral:true,stats:[10,8,9,7],lore:'Contiene la esencia pura de la oscuridad eterna. Inmune al terreno.',  cost:200},
  {id:'worldtree',   name:'Árbol del Mundo',   art:'art_worldtree',      f:'nat',  st:5,neutral:true,stats:[9,8,10,9],lore:'Sus raíces sostienen la realidad misma. Inmune al terreno.',           cost:200},
  {id:'eternaldrag', name:'Dragón Eterno',      art:'art_eternaldrag',     f:'fire', st:5,neutral:true,stats:[10,9,8,9],lore:'Existe desde antes que el tiempo tuviera nombre. Inmune al terreno.', cost:200},
];
// Merge shop cards into CARDS for rendering
SHOP_CARDS.forEach(c=>{if(!CARDS.find(x=>x.id===c.id))CARDS.push(c);});

// ── DUELISTS ──────────────────────────────────────────────────
const DUELISTS=[
  {id:0,name:'Aldeano Tomás',  port:'tomas',  f:'nat',  emoji:'👨‍🌾',title:'Aprendiz Perdido',     diff:1,reg:0,hint:'Solo cartas básicas de aldea',   cards:['rata_pantano','duende_bosque','lanzero','musgo_vivo','lobo_gris'],   lore:'Un granjero que aprendió a jugar por aburrimiento.',defeat:'¡Ja! ¡Y yo que pensé que cualquiera podía ganarme! Volvé cuando hayas practicado un poco más.'},
  {id:1,name:'Niña Lira',      port:'lira',   f:'nat',  emoji:'👧', title:'Prodigio del Bosque',   diff:1,reg:0,hint:'Cartas de naturaleza del bosque',  cards:['duende_bosque','musgo_vivo','lobo_gris','rata_pantano','chacal_viento'],      lore:'Dice que los árboles le enseñaron a jugar.',defeat:'Los árboles me enseñaron paciencia... tú aún no la has aprendido. Intenta de nuevo.'},
  {id:2,name:'Guardia Rowan',  port:'rowan',  f:'fire', emoji:'💂', title:'Soldado de Frontera',   diff:2,reg:0,hint:'Guerreros de fuego básicos',       cards:['vigia_torre','paje_fuego','acolito','chispa','grumete'],     lore:'Defiende la aldea desde hace veinte años.',defeat:'Veinte años defendiendo esta aldea, ¡no iba a caer tan fácil! Espabila y vuelve.'},
  {id:3,name:'Mercader Vex',   port:'vex',    f:'void', emoji:'🧙', title:'Comerciante Oscuro',    diff:2,reg:1,hint:'Mezcla facciones y void menor',    cards:['coleccionista_masc','sombra_menor','esqueleto','demonio_menor','nigromante'],lore:'Compra y vende secretos más que cartas.',defeat:'Cada derrota tiene un precio... y tú acaba de pagarlo. Vuelve con más monedas de experiencia.'},
  {id:4,name:'Capitán Zarra',  port:'zarra',  f:'fire', emoji:'⚔️',title:'Comandante de la Flota', diff:3,reg:1,hint:'Fuego y tormenta combinados',      cards:['paje_fuego','acolito','escudero_llama','canon_magico','timonel_fantasma'],lore:'Nunca perdió una batalla naval... ni de cartas.',defeat:'¡Mi flota nunca ha sido hundida, y hoy tampoco! Reagrupa tus fuerzas y vuelve a atacar.'},
  {id:5,name:'Hechicera Mira', port:'mira',   f:'storm',emoji:'🔮',title:'Arcanista de Tormenta',  diff:3,reg:1,hint:'Tormenta y velocidad',             cards:['chispa','grumete','cartografo_tormenta','jinete_trueno','medusa_marina'],lore:'Sus cartas cambian el clima cuando las juega.',defeat:'La tormenta siempre regresa... y yo también estaré aquí. Estudia bien antes de desafiarme.'},
  {id:6,name:'Lord Grevik',    port:'grevik', f:'fire', emoji:'🏰',title:'Señor del Norte',        diff:3,reg:2,hint:'Fuego de medio y alto poder',      cards:['ogro_fango','golem_barro','druida_joven','armero_volcanico','oso_roca'], lore:'Gobernó el norte con puño de hierro.',defeat:'El norte me ha obedecido por décadas. Tú no eres excepción. Vuélvete, forastero.'},
  {id:7,name:'Bruja Valdra',   port:'valdra', f:'void', emoji:'🧙‍♀️',title:'Maga de las Sombras',  diff:4,reg:2,hint:'Vacío oscuro y alto poder',       cards:['fantasma_guerra','espía_sombra','medium_encadenado','voidwalker','specter'],lore:'Se dice que robó su primer mazo de un dios menor.',defeat:'Las sombras te han engullido, como a todos los que se atrevieron. Huye mientras puedas.'},
  {id:8,name:'Archimago Eron', port:'eron',   f:'storm',emoji:'⚡',title:'Maestro de las Runas',   diff:4,reg:2,hint:'Tormenta legendaria',               cards:['jinete_trueno','medusa_marina','gnomo_runa','runeelf','lightning'],lore:'Descifró el Darkspell. Casi lo destruye en el proceso.',defeat:'El Darkspell tiene siglos de sabiduría. Tú, apenas unos minutos. Vuelve a estudiar.'},
  {id:9,name:'General Drak',   port:'drak',   f:'void', emoji:'💀',title:'Mano del Señor Oscuro',  diff:4,reg:3,hint:'Las mejores cartas del Vacío',     cards:['custodio_tumbas','specter','sombra','fantasma_guerra','espía_sombra'],lore:'Sirve a Malachar hace dos siglos. Nunca ha envejecido.',defeat:'Doscientos años sirviendo a la oscuridad... y tú creías poder con eso. Impresionante tu audacia, lamentable tu fin.'},
  {id:10,name:'Reina Sylara',  port:'sylara', f:'nat',  emoji:'👸',title:'Última Reina Elfa',      diff:5,reg:3,hint:'Las cartas más balanceadas',        cards:['elfqueen','ancestro_bosque','sylvan','treefolk','runeelf'],lore:'Su mazo fue bendecido por los dioses del bosque eterno.',defeat:'Los dioses del bosque eterno me protegen. No eres digno de la Ciudadela, no todavía.'},
  {id:11,name:'Lord Malachar', port:'malachar2',f:'void',emoji:'👑',title:'El Destructor Eterno',   diff:5,reg:3,hint:'El mazo más poderoso del reino',    cards:['archon','voidlord','sombra','fantasma_guerra','espía_sombra'],lore:'Quien lo vence, se convierte en leyenda. Ninguno lo ha logrado... aún.',defeat:'Nadie ha quebrado el Darkspell en mil años. Tú no serás el primero. Arrodíllate.'},
  // ── MUNDO 2: El Vacío Eterno ──────────────────────────────────
  {id:12,name:'La Sombra de Sid',   port:'malachar2',f:'void', emoji:'👤',title:'Eco del Otro Lado',        diff:5,reg:4, world:3,hint:'Una copia oscura de Sid Ionem',    cards:['archon','voidlord','voidwalker','sombra','specter'],      lore:'Lo que Sid Ionem habría sido si hubiera cruzado al otro lado.',      defeat:'Eres un espejo roto de lo que debiste ser.'},
  {id:13,name:'Xal la Desterrada',  port:'valdra',   f:'void', emoji:'🌑',title:'Exiliada del Vacío',        diff:5,reg:4, world:3,hint:'Void puro de alto poder',          cards:['apocbeast','titancosmico','sombra','voidwalker','espía_sombra'],   lore:'Fue exiliada del vacío mismo por ser demasiado oscura.',            defeat:'El exilio me hizo más fuerte que cualquier reino.'},
  {id:14,name:'Kael Tormenta',      port:'eron',     f:'storm',emoji:'⛈️',title:'Señor del Cielo Roto',     diff:5,reg:5, world:3,hint:'Tormenta al máximo poder',         cards:['leviathan','emperatriz_rayo','runeelf','jinete_trueno','medusa_marina'],   lore:'Partió los cielos en dos. El trueno aún lleva su nombre.',          defeat:'El cielo obedece solo mis órdenes. El tuyo se rompió.'},
  {id:15,name:'Driada Corrupta',    port:'sylara',   f:'nat',  emoji:'🌿',title:'Guardiana Caída',           diff:5,reg:5, world:3,hint:'Naturaleza oscura y bestias',      cards:['elfqueen','apocbeast','driada','sylvan','oso_roca'],    lore:'El bosque eterno la rechazó. Ahora ella lo consume.',               defeat:'La raíz que no crece hacia arriba, crece hacia el abismo.'},
  {id:16,name:'Almirante Nox',      port:'zarra',    f:'storm',emoji:'🚢',title:'Capitán de la Flota Negra', diff:6,reg:6, world:3,hint:'Tormenta legendaria combinada',    cards:['kraken','stormtitan','lightning','medusa_marina','jinete_trueno'],lore:'Su flota nunca fue vista. Solo el rastro de naufragios.',           defeat:'El mar negro te reclama. Que descanses en sus profundidades.'},
  {id:17,name:'Pyros el Inmortal',  port:'grevik',   f:'fire', emoji:'🔥',title:'Dios del Fuego Antiguo',    diff:6,reg:6, world:3,hint:'Fuego legendario y destrucción',   cards:['firelord','senor_forjas','warchief','guerrero','imán_llamas'],lore:'Arde desde antes que existiera la primera estrella.',               defeat:'El fuego nunca muere. Yo tampoco.'},
  {id:18,name:'El Archivista',      port:'vex',      f:'void', emoji:'📜',title:'Guardián del Conocimiento',  diff:6,reg:7, world:3,hint:'El mazo más estudiado del vacío', cards:['darkspell','voidlord','sombra','nigromante','espía_sombra'],lore:'Lleva siglos coleccionando los secretos de cada duelo.',            defeat:'Lo sabía todo de ti. Y aun así... interesante.'},
  // ── MUNDO 3: El Reino Invertido ────────────────────────────────
  {id:26,name:'Inquisidora Ren',   port:'malachar2', f:'fire', emoji:'🔥',title:'Justicia de Brasas',        diff:6,reg:10,world:2,hint:'Fuego ofensivo, castiga rápido',   cards:['escudero_llama','armero_volcanico','domador_salam','inquisidora_brasas','imán_llamas'], lore:'Juzga con el fuego. Nunca ha absuelto a nadie.',                        defeat:'El fuego no perdona. Y yo tampoco.'},
  {id:27,name:'Nigromante Vael',   port:'malachar2', f:'void', emoji:'📖',title:'Bibliotecario del Olvido', diff:6,reg:10,world:2,hint:'Vacío táctico, libros que atacan', cards:['sombra_menor','coleccionista_masc','medium_encadenado','nigromante_bibl','espía_sombra'], lore:'Cada libro que posee fue, alguna vez, una persona con nombre.',        defeat:'Otro nombre más para mi biblioteca. Gracias.'},
  {id:28,name:'Almirante Rhess',   port:'malachar2', f:'storm',emoji:'⚓',title:'Señor de la Flota Rota',   diff:6,reg:11,world:2,hint:'Tormenta naval, constante',        cards:['gnomo_runa','cartografo_tormenta','navegante_corriente','almirante_rayo','medusa_marina'], lore:'Su flota naufragó hace un siglo. Sigue dando órdenes igual.',           defeat:'Ni el naufragio me detuvo. ¿Creíste que tú lo harías?'},
  {id:29,name:'Guardiana Sel',     port:'malachar2', f:'nat',  emoji:'🌿',title:'Custodia de lo Torcido',   diff:6,reg:11,world:2,hint:'Naturaleza corrupta, resistente',   cards:['duende_bosque','apicultor_druida','guardabosques_cent','guardiana_raices','oso_roca'], lore:'Protege un bosque que ya no existe en este lado del espejo.',          defeat:'Las raíces siempre vuelven a crecer. Incluso las torcidas.'},
  {id:30,name:'Campeona Ixara',    port:'malachar2', f:'fire', emoji:'⚔',title:'Gladiadora del Reflejo',   diff:6,reg:12,world:2,hint:'Fuego agresivo, alto poder',       cards:['herrera_legend','domador_salam','armero_volcanico','campeona_gladiadora','firelord'], lore:'Ganó su libertad mil veces. En este reino, no cuenta ninguna.',        defeat:'En el espejo también gano. Siempre gano.'},
  {id:31,name:'Verdugo Nyx',       port:'malachar2', f:'void', emoji:'🗿',title:'Ejecutor de Máscaras',     diff:6,reg:12,world:2,hint:'Vacío puro, sin piedad',           cards:['espía_sombra','coleccionista_masc','nigromante_bibl','verdugo_mascaras','sombra'], lore:'Nadie ha visto su rostro. Ni siquiera él lo recuerda ya.',              defeat:'Una máscara menos por descubrir. Qué lástima.'},
  {id:32,name:'Corsaria Vael',     port:'malachar2', f:'storm',emoji:'🌪',title:'Capitana del Cielo Roto', diff:6,reg:13,world:2,hint:'Tormenta veloz, casi imparable',   cards:['jinete_trueno','almirante_rayo','navegante_corriente','corsaria_cielo','stormtitan'], lore:'Su barco vuela entre nubes que no deberían existir.',                   defeat:'El cielo de este reino es mío. Siempre lo fue.'},
  {id:33,name:'El Rey Invertido',  port:'malachar2', f:'void', emoji:'👑',title:'Trono de lo que Pudo Ser', diff:7,reg:13,world:2,hint:'El jefe del Reino Invertido',       cards:['custodio_tumbas','archimagister_vacio','verdugo_mascaras','voidlord','silencio_vacio'], lore:'Es lo que Aetherion pudo haber sido, si el reino hubiera perdido.',     defeat:'Gobernás un reflejo roto. Yo gobernaba el original.'},
  // ── MUNDO 4: Los Heraldos Oscuros ──────────────────────────────
  {id:20,name:'Heraldo de la Guerra',    port:'grevik',   f:'fire', emoji:'🔥',title:'Eco de Mil Batallas',      diff:5,reg:8, world:4,hint:'Fuego mixto, presión constante',  cards:['warchief','guerrero','escudero_llama','imán_llamas','firelord'],   lore:'El eco de cada guerra que el reino olvidó. Arde sin consumirse.',      defeat:'Las guerras no terminan. Solo cambian de campo.'},
  {id:21,name:'Heraldo de la Tormenta',  port:'eron',     f:'storm',emoji:'⛈️',title:'Eco del Primer Trueno',    diff:5,reg:8, world:4,hint:'Tormenta veloz y letal',        cards:['runeelf','heraldo_cielos_rotos','jinete_trueno','medusa_marina','kraken'],    lore:'Nació del primer rayo que tocó la tierra. Aún resuena.',               defeat:'El trueno siempre vuelve. Yo también.'},
  {id:22,name:'Heraldo del Bosque',      port:'sylara',   f:'nat',  emoji:'🌲',title:'Eco de la Primera Semilla', diff:5,reg:8, world:4,hint:'Naturaleza defensiva y paciente',cards:['madre_estaciones','sylvan','oso_roca','golem_barro','elfqueen'],             lore:'Recuerda cada árbol talado, cada raíz arrancada.',                     defeat:'El bosque es paciente. Puede esperar otra era.'},
  {id:23,name:'Heraldo del Abismo',      port:'valdra',   f:'void', emoji:'🌑',title:'Eco de lo Innombrable',     diff:6,reg:8, world:4,hint:'Vacío puro, alto poder',        cards:['sombra','archimagister_vacio','fantasma_guerra','voidlord','apocbeast'],    lore:'Lo que quedó cuando el abismo miró de vuelta.',                        defeat:'Miraste demasiado tiempo. Ahora te conozco.'},
  {id:24,name:'El Heraldo Sin Nombre',   port:'malachar2',f:'void', emoji:'🕳',title:'El Último Guardián',        diff:6,reg:8, world:4,hint:'El duelo definitivo',           cards:['darkspell','skullking','silencio_vacio','sombra','espía_sombra'],          lore:'No custodia un tesoro. Custodia el final de la historia.',             defeat:'...Aún no. Pero estás cerca de comprender.'},
  {id:25,name:'El Vacío Encarnado', port:'malachar2',f:'void', emoji:'🕳',title:'El Final de Todo',           diff:6,reg:9, world:4,hint:'Todo su mazo es legendario',      cards:['darkspell','titancosmico','skullking','elfqueen','corazon_volcan'],     lore:'Cuando los Cinco Heraldos Oscuros callaron, el agujero negro abrió los ojos. No custodia el final: ES el final.', defeat:'Imposible... ¿Qué sos vos, que apagás la oscuridad misma?'},
  {id:19,name:'El Origen',          port:'malachar2',f:'void', emoji:'🌀',title:'Lo Que Existió Antes',       diff:6,reg:7, world:3,hint:'El mazo definitivo del Vacío',    cards:['skullking','darkspell','titancosmico','sombra','fantasma_guerra'],lore:'No tiene nombre propio. Existía antes del lenguaje.',               defeat:'...Inesperado. Quizás el tiempo sí cambia las cosas.'},
];
const REGS=[
  {name:'🌾 Tierras del Comienzo',col:'#52b788'},
  {name:'🏰 Castillo del Mercader',col:'#c9930a'},
  {name:'🗡 Fortaleza del Norte',  col:'#4895ef'},
  {name:'💀 La Ciudadela Oscura',  col:'#9d4edd'},
];
const CINE_DATA=[
  {img:'c0',title:'Rumores de un Nuevo Héroe',
   text:'Las noticias viajan rápido por los caminos. En las tabernas se habla de un viajero que venció a los duelistas de las Tierras del Comienzo sin perder una sola carta importante. Tras las murallas del Castillo del Mercader, alguien escucha con atención... y sonríe.'},
  {img:'c1',title:'El Eco de la Tormenta',
   text:'El Castillo del Mercader cae en silencio. Hacia el norte, nubes cargadas de rayos se acumulan sobre la Fortaleza, como si la tormenta misma supiera lo que se aproxima. Los soldados de Lord Grevik afilan sus espadas, pero algunos ya empiezan a dudar de su lealtad.'},
  {img:'c2',title:'La Ciudadela Despierta',
   text:'En lo más profundo de la Ciudadela Oscura, algo enorme abre los ojos por primera vez en siglos. Lord Malachar siente la perturbación en el tejido del Vacío: alguien se acerca al trono. Ordena que las puertas malditas permanezcan abiertas. "Que venga," susurra. "Quiero ver de qué está hecho."'},
  {img:'c3',title:'El Trono Vacío',
   text:'El Darkspell se apaga en las manos de Malachar y su corona rueda por las escaleras del trono. El reino, libre del Destructor Eterno, respira por primera vez en generaciones. Pero en las cartas que aún brillan con magia oscura, una pregunta queda flotando: ¿qué despertó realmente al abrir ese trono?'},
];


// Escenas del Vacío Eterno y El Reino Invertido: reutilizan arte de cartas
// ya existente (sin ilustraciones dedicadas) para no sumar peso al juego.
CINE_DATA[4]={art:'sombra_vacio',title:'El Reflejo que Observa',
  text:'El velo tras Malachar se abre en un espacio que no debería existir. Sid observa cada movimiento del viajero desde un espejo que nunca refleja lo mismo dos veces. "Otro que cree que esto es un final," susurra. "Aquí, todo empieza de nuevo, y peor."'};
CINE_DATA[5]={art:'art_stormbringer',title:'El Cielo se Rompe',
  text:'El Espejo Roto queda atrás, pero el cielo del Vacío jamás estuvo entero. Kael Tormenta convoca vientos que no obedecen ninguna dirección conocida, y la Dríada Corrupta observa desde raíces que crecen hacia arriba, buscando un sol que no existe en este lado del velo.'};
CINE_DATA[6]={art:'kraken',title:'Las Aguas que No Reflejan',
  text:'Bajo Cielos Partidos se extiende un mar sin luna ni estrellas: el Mar Negro. Almirante Nox navega una flota hundida hace siglos, y Pyros el Inmortal arde bajo el agua sin apagarse nunca. Algo enorme se mueve en las profundidades, esperando su turno.'};
CINE_DATA[7]={art:'apocbeast',title:'Donde Todo Comenzó',
  text:'El Mar Negro desemboca en un solo punto: El Origen. Aquí no hay más territorio del Vacío que cruzar — solo El Archivista, guardián de cada secreto, y detrás de él, la entidad que le da nombre a este lugar. Vencerla podría abrir algo que el reino no está listo para ver.'};
CINE_DATA[10]={art:'devorador_rec',title:'El Reflejo Cobra Forma',
  text:'Del otro lado del reflejo, Aetherion existe torcido: un reino que ganó todas las guerras que el original perdió. Inquisidora Ren juzga con fuego a quien no jura lealtad al trono invertido, y el Nigromante Vael archiva cada nombre que cruza el umbral. El tuyo, ya lo anotó.'};
CINE_DATA[11]={art:'custodio_tumbas',title:'La Fortaleza que Nunca Cayó',
  text:'Ecos de Cristal se astilla detrás. El Bastión Quebrado se sostiene con hilos de energía violeta donde debería haber piedra. Almirante Rhess comanda una flota que naufragó hace un siglo y sigue dando órdenes, y la Guardiana Sel custodia raíces de un bosque que ya no existe en ningún mapa.'};
CINE_DATA[12]={art:'verdugo_ciego',title:'El Ocaso que No Termina',
  text:'El sol de este reino se puso hace mucho y decidió quedarse así. En la Vigía del Ocaso, la Campeona Ixara gana combates que ya ganó mil veces antes, y el Verdugo Nyx ejecuta sentencias sin rostro propio. Cada victoria aquí se siente, extrañamente, como un eco.'};
CINE_DATA[13]={art:'archimagister_vacio',title:'El Trono que Pudo Ser',
  text:'Solo queda el Trono Invertido. La Corsaria Vael vuela entre nubes que no deberían sostener nada, guardiana de las últimas puertas. Y detrás de ellas, sentado en un reflejo perfecto del poder que Aetherion nunca dejó caer en malas manos, espera El Rey Invertido.'};

// ── SAVE (autoguardado) ───────────────────────────────────────
const INITIAL_COLL=['rata_pantano','esqueleto','lanzero','chispa','escudero_llama','jinete_trueno']; // 6 de inicio: cuatro ★1 + dos ★2 para tener chance temprana
let SAVE={coll:[...INITIAL_COLL],beaten:[],cineSeen:[],mp:0,world:1,avatar:'tomas',unlockedAvatars:['tomas'],energy:10,stats:{duelsWon:0,qmWins:0,mpGames:0},achClaimed:[]};
(()=>{try{const s=localStorage.getItem('ds5');if(s)Object.assign(SAVE,JSON.parse(s));}catch(e){}})();


// ── SISTEMA DE ENERGÍA ───────────────────────────────────────
const ENERGY={max:30,duel:2,spectral:3,rematch:1,win:4,qm:1,regenMs:180000}; // +1 ⚡ cada 3 minutos
let _nextDuelCost=null;
function updateAchBadge(){
  const b=document.getElementById('ach-badge');
  if(!b)return;
  let n=0;
  try{ n=achClaimable(); }catch(e){ return; } // ACHIEVEMENTS aún no inicializado durante la carga
  b.style.display=n>0?'block':'none';
  b.textContent=n;
}
function updateEnergyUI(){
  const a=document.getElementById('energycnt'); if(a)a.textContent=(SAVE.energy||0);
  const b=document.getElementById('energy-display'); if(b)b.textContent=(SAVE.energy||0)+' / '+ENERGY.max+' ⚡';
  const t=document.getElementById('energy-timer');
  if(t){
    if((SAVE.energy||0)>=ENERGY.max){ t.textContent=''; }
    else{
      const rest=Math.max(0, ENERGY.regenMs-(Date.now()-(SAVE.eTs||Date.now())));
      const m=Math.floor(rest/60000), s=Math.floor(rest%60000/1000);
      t.textContent='+1 en '+m+':'+String(s).padStart(2,'0');
    }
  }
}
function energyTick(){
  updateAchBadge();
  if(SAVE.eTs===undefined){ SAVE.eTs=Date.now(); save(); }
  if((SAVE.energy||0)>=ENERGY.max){ SAVE.eTs=Date.now(); updateEnergyUI(); return; }
  const elapsed=Date.now()-SAVE.eTs;
  const gained=Math.floor(elapsed/ENERGY.regenMs);
  if(gained>0){
    SAVE.energy=Math.min(ENERGY.max,(SAVE.energy||0)+gained);
    SAVE.eTs=(SAVE.energy>=ENERGY.max)?Date.now():SAVE.eTs+gained*ENERGY.regenMs;
    save();
  }
  updateEnergyUI();
}
setInterval(energyTick,1000);
energyTick(); // acreditar lo acumulado mientras el juego estuvo cerrado
function gainEnergy(n){SAVE.energy=Math.min(ENERGY.max,(SAVE.energy||0)+n);save();updateEnergyUI();}
function buyEnergy(amount,cost){
  if((SAVE.mp||0)<cost){ showToastMsg('✨ Te faltan PM. Vendé cartas repetidas para conseguir más.'); return; }
  if((SAVE.energy||0)>=ENERGY.max){ showToastMsg('⚡ Tu energía ya está al máximo.'); return; }
  SAVE.mp-=cost; gainEnergy(amount);
  showToastMsg('⚡ +'+amount+' de energía comprada.');
  renderCollectionScreen();
}
function showToastMsg(txt){
  const t=document.createElement('div');
  t.style.cssText='position:fixed;bottom:16%;left:50%;transform:translateX(-50%);z-index:600;background:rgba(13,27,75,.97);border:1px solid var(--gold2);border-radius:10px;padding:.6rem 1.1rem;font-family:Philosopher,serif;font-size:.78rem;color:var(--tx);box-shadow:0 4px 20px rgba(0,0,0,.6);max-width:280px;text-align:center;';
  t.textContent=txt; document.body.appendChild(t);
  setTimeout(()=>{t.style.transition='opacity .5s';t.style.opacity='0';setTimeout(()=>t.remove(),500);},2200);
}
function showNoEnergy(cost){
  const ov=document.createElement('div');
  ov.style.cssText='position:fixed;inset:0;z-index:500;background:rgba(0,0,0,.85);backdrop-filter:blur(5px);display:flex;align-items:center;justify-content:center;padding:1.2rem;';
  ov.innerHTML='<div style="background:linear-gradient(135deg,rgba(13,27,75,.97),rgba(7,8,15,.97));border:2px solid #f4d35e;border-radius:14px;padding:1.4rem;max-width:300px;width:100%;text-align:center;">'
    +'<div style="font-size:2rem;margin-bottom:.4rem">⚡</div>'
    +'<div style="font-family:Cinzel,serif;font-size:.95rem;color:#f4d35e;margin-bottom:.5rem">Sin energía suficiente</div>'
    +'<div style="font-family:Philosopher,serif;font-size:.78rem;color:var(--td);line-height:1.6;margin-bottom:1rem">Este duelo cuesta <strong style="color:#f4d35e">'+cost+' ⚡</strong> y tenés <strong style="color:#f4d35e">'+(SAVE.energy||0)+' ⚡</strong>.<br><br>Podés comprar energía en la <strong style="color:#e0aaff">Tienda arcana</strong> con tus ✨ PM, o jugar <strong style="color:#f4a261">Partidas Rápidas</strong> (gratis, +'+ENERGY.qm+' ⚡ por victoria).<br><br>⏳ Además, la energía se recarga sola: <strong style="color:#f4d35e">+1 ⚡ cada 3 minutos</strong>, incluso con el juego cerrado.</div>'
    +'<div style="display:flex;flex-direction:column;gap:.5rem;">'
    +'<button class="btn xs" style="border-color:#e0aaff;color:#e0aaff" onclick="this.closest(\'div\').parentNode.parentNode.remove();showS(\'collection-screen\');switchCollTab(\'shop\')">✨ Ir a la tienda</button>'
    +'<button class="btn xs" style="border-color:#f4a261;color:#f4a261" onclick="this.closest(\'div\').parentNode.parentNode.remove();quickMatch()">⚡ Partida Rápida</button>'
    +'<button class="btn xs" style="border-color:var(--td);color:var(--td)" onclick="this.closest(\'div\').parentNode.parentNode.remove()">Cerrar</button>'
    +'</div></div>';
  document.body.appendChild(ov);
}
function mapBack(){
  SAVE.world=Math.max(1,SAVE.world-1);
  save(); renderMap();
}


// ── LOGROS ───────────────────────────────────────────────────
// reward: {energy:n} o {card:'id'}
const ACHIEVEMENTS=[
  {id:'primera_sangre', icon:'⚔', name:'Primera Sangre',      desc:'Ganá tu primer duelo',                      goal:1,  prog:()=>Math.min(1,(SAVE.stats&&SAVE.stats.duelsWon)||0),                    reward:{energy:5}},
  {id:'conquistador',   icon:'🏰', name:'Conquistador',        desc:'Completá el Mundo 1 (12 duelistas)',        goal:12, prog:()=>SAVE.beaten.filter(x=>x<=11).length,                                  reward:{energy:10}},
  {id:'senor_vacio',    icon:'🌀', name:'Señor del Vacío',     desc:'Completá el Vacío Eterno (8 duelistas)',    goal:8,  prog:()=>SAVE.beaten.filter(x=>x>=12&&x<=19).length,                           reward:{energy:15}},
  {id:'reino_invertido', icon:'👑', name:'Amo del Reflejo',      desc:'Completá El Reino Invertido (8 duelistas)', goal:8,  prog:()=>SAVE.beaten.filter(x=>x>=26&&x<=33).length,                           reward:{energy:15}},
  {id:'cazafantasmas',  icon:'👻', name:'Cazador de Heraldos',  desc:'Vencé a los Cinco Heraldos Oscuros',        goal:5,  prog:()=>SAVE.beaten.filter(x=>x>=20&&x<=24).length,                           reward:{card:'apocbeast'}},
  {id:'leyenda',        icon:'🏆', name:'Leyenda de Aetherion',desc:'Completá el juego: vencé al Vacío Encarnado',goal:1, prog:()=>SAVE.beaten.includes(25)?1:0,                                         reward:{card:'titancosmico'}},
  {id:'coleccionista',  icon:'📚', name:'Coleccionista',       desc:'Reuní 30 cartas únicas',                    goal:30, prog:()=>new Set(SAVE.coll).size,                                              reward:{energy:10}},
  {id:'completista',    icon:'✨', name:'Colección Completa',  desc:'Reuní todas las cartas del juego',          goal:()=>CARDS.length, prog:()=>new Set(SAVE.coll).size,                                reward:{energy:30}},
  {id:'rayo_veloz',     icon:'⚡', name:'Rayo Veloz',          desc:'Ganá 10 Partidas Rápidas',                  goal:10, prog:()=>(SAVE.stats&&SAVE.stats.qmWins)||0,                                   reward:{card:'lightning'}},
  {id:'maratonista',    icon:'🔥', name:'Maratonista',         desc:'Ganá 25 duelos en total',                   goal:25, prog:()=>((SAVE.stats&&SAVE.stats.duelsWon)||0)+((SAVE.stats&&SAVE.stats.qmWins)||0), reward:{energy:15}},
  {id:'multijugador',   icon:'🌐', name:'Rival de Carne y Hueso', desc:'Jugá 10 partidas multijugador', goal:10, prog:()=>(SAVE.stats&&SAVE.stats.mpGames)||0,                        reward:{energy:20}},
];
function achGoal(a){return typeof a.goal==='function'?a.goal():a.goal;}
function achDone(a){return a.prog()>=achGoal(a);}
function achClaimable(){return ACHIEVEMENTS.filter(a=>achDone(a)&&!(SAVE.achClaimed||[]).includes(a.id)).length;}
function claimAch(id){
  const a=ACHIEVEMENTS.find(x=>x.id===id);
  if(!a||!achDone(a)||(SAVE.achClaimed||[]).includes(id))return;
  SAVE.achClaimed=SAVE.achClaimed||[];
  SAVE.achClaimed.push(id);
  let msg='';
  if(a.reward.energy){ SAVE.energy=(SAVE.energy||0)+a.reward.energy; msg='+'+a.reward.energy+' ⚡ de energía'; } // los logros pueden superar el tope
  if(a.reward.card){ SAVE.coll.push(a.reward.card); const c=CARDS.find(x=>x.id===a.reward.card); msg='carta '+(c?c.name:a.reward.card)+' ('+'★'.repeat(c?c.st:0)+')'; }
  save(); updateEnergyUI(); checkAvatarUnlocks();
  showToastMsg('🏆 ¡'+a.name+'! Recompensa: '+msg);
  renderAchievements();
}
function renderAchievements(){
  let ov=document.getElementById('ach-ov');
  if(!ov){
    ov=document.createElement('div');
    ov.id='ach-ov';
    ov.style.cssText='position:fixed;inset:0;z-index:450;background:rgba(0,0,5,.92);backdrop-filter:blur(6px);display:flex;flex-direction:column;align-items:center;padding:1.2rem;overflow-y:auto;';
    document.body.appendChild(ov);
  }
  const rewardTxt=a=>a.reward.energy?('+'+a.reward.energy+' ⚡'):(()=>{const c=CARDS.find(x=>x.id===a.reward.card);return '🃏 '+(c?c.name:'carta');})();
  let html='<div style="font-family:\'Cinzel Decorative\',serif;font-size:1.05rem;color:var(--gold);margin:.4rem 0 .9rem;text-shadow:0 0 14px rgba(255,209,102,.4)">🏆 Logros</div>';
  html+='<div style="width:100%;max-width:380px;display:flex;flex-direction:column;gap:.5rem;">';
  ACHIEVEMENTS.forEach(a=>{
    const p=Math.min(a.prog(),achGoal(a)), gl=achGoal(a);
    const done=achDone(a), claimed=(SAVE.achClaimed||[]).includes(a.id);
    const pct=Math.round(p/gl*100);
    const col=claimed?'#52b788':done?'#f4d35e':'rgba(255,209,102,.35)';
    html+='<div style="background:rgba(13,27,75,.6);border:1.5px solid '+col+';border-radius:10px;padding:.6rem .7rem;">'
      +'<div style="display:flex;align-items:center;gap:.6rem;">'
      +'<div style="font-size:1.3rem;flex-shrink:0;'+(done?'':'filter:grayscale(1);opacity:.5;')+'">'+a.icon+'</div>'
      +'<div style="flex:1;min-width:0;">'
      +'<div style="font-family:Cinzel,serif;font-size:.72rem;color:'+(done?'var(--gold)':'var(--td)')+'">'+a.name+'</div>'
      +'<div style="font-family:Philosopher,serif;font-size:.62rem;color:var(--td)">'+a.desc+'</div>'
      +'<div style="height:5px;background:rgba(255,255,255,.08);border-radius:3px;margin-top:.3rem;overflow:hidden"><div style="height:100%;width:'+pct+'%;background:'+(claimed?'#52b788':'linear-gradient(90deg,#c9930a,#ffd166)')+';border-radius:3px"></div></div>'
      +'<div style="font-size:.58rem;color:var(--td);margin-top:.15rem">'+p+' / '+gl+' &nbsp;·&nbsp; Recompensa: '+rewardTxt(a)+'</div>'
      +'</div>'
      +(claimed
        ?'<div style="font-size:.62rem;color:#52b788;font-family:Cinzel,serif;flex-shrink:0">✓</div>'
        :done
          ?'<button class="btn xs" style="border-color:#f4d35e;color:#f4d35e;flex-shrink:0" onclick="claimAch(\''+a.id+'\')">Reclamar</button>'
          :'<div style="font-size:.9rem;opacity:.4;flex-shrink:0">🔒</div>')
      +'</div></div>';
  });
  html+='</div><button class="btn xs" style="margin:1rem 0;border-color:var(--td);color:var(--td)" onclick="document.getElementById(\'ach-ov\').remove()">✕ Cerrar</button>';
  ov.innerHTML=html;
}

// ── AVATARES ─────────────────────────────────────────────────
const AVATARS = {
  tomas:        {name:'Aldeano Tomás',    img:AVATAR_IMG.tomas,        unlock:'start',            desc:'Tu compañero desde el inicio.'},
  golem:        {name:'Gólem de Fuego',   img:AVATAR_IMG.golem,        unlock:'reg2',             desc:'Desbloqueado al conquistar la Fortaleza del Norte.'},
  heroe:        {name:'El Héroe',         img:AVATAR_IMG.heroe,        unlock:'reg0',             desc:'Conquistá las Tierras del Comienzo.'},
  corsario:     {name:'El Corsario',      img:AVATAR_IMG.corsario,     unlock:'reg1',             desc:'Conquistá el Castillo del Mercader.'},
  senor_oscuro: {name:'Señor Oscuro',     img:AVATAR_IMG.senor_oscuro, unlock:'reg3',             desc:'Conquistá la Ciudadela Oscura.'},
  arquera:      {name:'Arquera Élfica',   img:AVATAR_IMG.arquera,      unlock:'card:arquera_elfa',desc:'Conseguí la carta Arquera Élfica.'},
  driada_av:    {name:'Dríada',           img:AVATAR_IMG.driada_av,    unlock:'card:driada',      desc:'Conseguí la carta Dríada Guardiana.'},
  elfo_runico:  {name:'Elfo Rúnico',      img:AVATAR_IMG.elfo_runico,  unlock:'card:runeelf',     desc:'Conseguí la carta Elfo Rúnico.'},
  senor_fuego:  {name:'Señor del Fuego',  img:AVATAR_IMG.senor_fuego,  unlock:'card:firelord',    desc:'Conseguí la carta Señor del Fuego.'},
  jefe_guerra:  {name:'Jefe de Guerra',   img:AVATAR_IMG.jefe_guerra,  unlock:'card:warchief',    desc:'Conseguí la carta Jefe de Guerra.'},
  reina_elfa:   {name:'Merrik Ionem',     img:AVATAR_IMG.reina_elfa,   unlock:'card:archon',      desc:'Conseguí la carta Merrik Ionem.'},
  rey_calavera: {name:'Rey Calavera',     img:AVATAR_IMG.rey_calavera, unlock:'card:skullking',   desc:'Conseguí la carta Rey Calavera.'},
};
// unlock keys: 'start'=siempre, 'reg0/1/2/3'=al vencer todos los duelos de esa región

// ── SISTEMA DE AVATARES ──────────────────────────────────────
function getAvatarImg(){
  const key=SAVE.avatar||'tomas';
  return AVATARS[key]?AVATARS[key].img:(AVATARS['tomas']?AVATARS['tomas'].img:'');
}

function updateMapAvatar(){
  const img=document.getElementById('player-avatar-img');
  if(img) img.src=getAvatarImg();
}

function showAvatarScreen(fromIntro){
  renderAvatarGrid();
  document.getElementById('avatar-skip-btn').style.display=fromIntro?'none':'';
  showS('avatar-screen');
}

function renderAvatarGrid(){
  const grid=document.getElementById('avatar-grid');
  if(!grid) return;
  grid.innerHTML='';
  Object.entries(AVATARS).forEach(([key,av])=>{
    const unlocked=(SAVE.unlockedAvatars||[]).includes(key);
    const selected=SAVE.avatar===key;
    const wrap=document.createElement('div');
    wrap.style.cssText='display:flex;flex-direction:column;align-items:center;';
    const card=document.createElement('div');
    card.className='avatar-card'+(selected?' selected':'')+(unlocked?'':' locked');
    const img=document.createElement('img');
    img.src=av.img;
    img.alt=av.name;
    card.appendChild(img);
    if(!unlocked){
      const lockEl=document.createElement('div');
      lockEl.className='avatar-lock';
      lockEl.textContent='🔒';
      card.appendChild(lockEl);
    }
    if(unlocked) card.onclick=()=>{
      document.querySelectorAll('.avatar-card').forEach(c=>c.classList.remove('selected'));
      card.classList.add('selected');
      SAVE.avatar=key;
    };
    const name=document.createElement('div');
    name.className='avatar-name';
    name.textContent=unlocked?av.name:'???';
    wrap.appendChild(card);
    wrap.appendChild(name);
    grid.appendChild(wrap);
  });
}

function confirmAvatarSelect(){
  save();
  updateMapAvatar();
  showS('map-screen');
}

// Verificar si se desbloquean nuevos avatares al vencer un duelo
function avatarUnlockMet(av){
  const u=av.unlock;
  if(u==='start')return true;
  if(u.indexOf('reg')===0){
    const n=parseInt(u.replace('reg','').replace(':',''));
    return DUELISTS.filter(d=>d.reg===n&&!d.world).every(d=>SAVE.beaten.includes(d.id));
  }
  if(u.indexOf('card:')===0)return SAVE.coll.includes(u.slice(5));
  return false;
}
function checkAvatarUnlocks(){
  const unlocked=SAVE.unlockedAvatars||['tomas'];
  const nuevos=[];
  Object.keys(AVATARS).forEach(k=>{
    if(!unlocked.includes(k)&&avatarUnlockMet(AVATARS[k])){unlocked.push(k);nuevos.push(k);}
  });
  SAVE.unlockedAvatars=unlocked;
  if(nuevos.length){save();showAvatarUnlockToast(nuevos[0]);}
}

function showAvatarUnlockToast(key){
  const av=AVATARS[key];
  if(!av) return;
  const toast=document.createElement('div');
  toast.style.cssText='position:fixed;bottom:5rem;left:50%;transform:translateX(-50%);z-index:600;background:rgba(13,27,75,.97);border:2px solid var(--gold);border-radius:10px;padding:.8rem 1.2rem;display:flex;align-items:center;gap:.8rem;max-width:280px;box-shadow:0 0 20px rgba(255,209,102,.3);animation:fadeIn .3s ease;';
  toast.innerHTML=`<img src="${av.img}" style="width:44px;height:44px;border-radius:50%;object-fit:cover;border:2px solid var(--gold);flex-shrink:0">
    <div>
      <div style="font-family:'Cinzel',serif;font-size:.65rem;color:var(--gold);letter-spacing:.1em">✦ NUEVO ASPECTO</div>
      <div style="font-family:'Philosopher',serif;font-size:.78rem;color:#fff;margin-top:.15rem">${av.name}</div>
      <div style="font-family:'Philosopher',serif;font-size:.65rem;color:var(--td);margin-top:.1rem">${av.desc}</div>
    </div>`;
  document.body.appendChild(toast);
  setTimeout(()=>{toast.style.opacity='0';toast.style.transition='opacity .5s';setTimeout(()=>toast.remove(),500);},3500);
}
// ── FIN AVATARES ─────────────────────────────────────────────

function save(){try{localStorage.setItem('ds5',JSON.stringify(SAVE));}catch(e){}}

// ── GAME STATE ────────────────────────────────────────────────
let G={board:Array(9).fill(null),cellEl:Array(9).fill(null),ph:[],eh:[],sel:null,turn:'player',over:false,ps:5,es:5,did:null};
let pendDid=null,dkSel=[];

// ── TUTORIAL SYSTEM ───────────────────────────────────────────
let TUT={active:false,step:0,steps:[],onDone:null,highlightEl:null};
const TUT_STARTER_DECK=['rata_pantano','lanzero','chispa','esqueleto','lobo_gris'];
const TUT_STARTER_NAMES=['Rata del Pantano','Lanzero de Aldea','Chispa Eléctrica','Esqueleto Errante','Lobo Gris'];

function tutShow(steps, onDone){
  TUT.active=true; TUT.step=0; TUT.steps=steps; TUT.onDone=onDone;
  document.getElementById('tut-overlay').classList.add('active');
  document.body.classList.add('tut-active');
  tutRender();
}
function tutRender(){
  const s=TUT.steps[TUT.step];
  if(!s){tutEnd();return;}
  const box=document.getElementById('tut-box');
  box.style.display='block';
  document.getElementById('tut-port-img').src=PORT[s.port||'tomas'];
  document.getElementById('tut-speaker').textContent=s.speaker||'Aldeano Tomás';
  document.getElementById('tut-text').innerHTML=s.text;
  document.getElementById('tut-next').textContent=s.btn||'Entendido →';
  // Always centered horizontally; only vary vertical position
  box.style.top=''; box.style.bottom='';
  if(s.bottom){
    box.style.bottom=s.bottom; box.style.top='auto';
  } else {
    box.style.top=s.top||'50%';
    // clamp so box never goes below viewport
    // handled by bottom clamp in CSS
  }
  // highlight element
  if(TUT.highlightEl){TUT.highlightEl.classList.remove('tut-highlight');TUT.highlightEl=null;}
  if(s.highlight){
    const el=document.querySelector(s.highlight);
    if(el){el.classList.add('tut-highlight');TUT.highlightEl=el;}
  }
  if(s.onShow) s.onShow();
}
function tutNext(){
  if(TUT.steps[TUT.step]&&TUT.steps[TUT.step].onNext) TUT.steps[TUT.step].onNext();
  TUT.step++;
  if(TUT.step>=TUT.steps.length){tutEnd();return;}
  tutRender();
}
function tutSkip(){
  // Marcar a Tomás como superado para desbloquear el siguiente enemigo
  if(!SAVE.beaten.includes(0)) SAVE.beaten.push(0);
  save();
  tutEnd();
  showS('map-screen');
}
function tutEnd(){
  document.getElementById('tut-box').style.display='none';
  document.getElementById('tut-overlay').classList.remove('active');
  document.body.classList.remove('tut-active');
  if(TUT.highlightEl){TUT.highlightEl.classList.remove('tut-highlight');TUT.highlightEl=null;}
  TUT.active=false;
  if(TUT.onDone) TUT.onDone();
}

// Tutorial steps for duelist 0 (Tomás)
function buildTutorialSteps(){
  return [
    {
      port:'tomas',speaker:'Aldeano Tomás',
      text:'¡Bien! Antes de que comencemos el duelo, dejame explicarte las reglas rápido. ¿Sabés cómo se juega?',
      btn:'Contame →',
      top:'20%',
    },
    {
      port:'tomas',speaker:'Aldeano Tomás',
      text:'El tablero es una grilla de <strong>3×3</strong>. Cada jugador coloca una carta por turno, hasta llenar las 9 casillas.',
      highlight:'#board',
      top:'20%',
    },
    {
      port:'tomas',speaker:'Aldeano Tomás',
      text:'Cada carta tiene <strong>4 números</strong>: ↑ arriba, → derecha, ↓ abajo, ← izquierda. El valor <strong>A</strong> es el más alto (vale 10).',
      highlight:'#phand .hc:first-child',
      bottom:'22%',
    },
    {
      port:'tomas',speaker:'Aldeano Tomás',
      text:'Cuando ponés una carta junto a una enemiga, si tu número <strong>supera</strong> al número adyacente del enemigo, ¡la capturás y pasa a tu color!',
      highlight:'#board',
      top:'20%',
    },
    {
      port:'tomas',speaker:'Aldeano Tomás',
      text:'¿Ves esos símbolos en el tablero? <strong>🔥⚡🍃🌀</strong> Son casillas elementales. Si tu carta comparte elemento, gana <strong>+1</strong> en todos sus valores. Si no coincide, pierde <strong>-1</strong>.',
      highlight:'#board',
      top:'20%',
    },
    {
      port:'tomas',speaker:'Aldeano Tomás',
      text:'Al final gana quien tenga más cartas de su color. Si ganás, podés <strong>quedarte una carta capturada</strong> del rival. ¡Así se construye una colección!',
      top:'20%',
    },
    {
      port:'tomas',speaker:'Aldeano Tomás',
      text:'Tocá una carta de tu mano para <strong>seleccionarla</strong>, y después tocá una casilla del tablero para colocarla. ¡Ahora sí, empecemos!',
      highlight:'#phand',
      bottom:'22%',
      btn:'¡Vamos! ⚔',
    },
  ];
}

// Called after tutorial wins Tomás — give starter deck
function tutorialReward(){
  const newCards=TUT_STARTER_DECK.filter(c=>!SAVE.coll.includes(c));
  newCards.forEach(c=>SAVE.coll.push(c));
  save();
  const box=document.getElementById('rrew');
  const rrewt=document.getElementById('rrewt');
  const rrewd=document.getElementById('rrewd');
  box.style.display='block';
  rrewt.textContent='🎁 ¡Tomás te entrega su mazo de inicio!';
  rrewd.innerHTML='<div style="font-size:.78rem;color:var(--td);margin-bottom:.45rem">Ahora tenés estas cartas en tu colección:</div>'
    +'<div style="display:flex;flex-wrap:wrap;gap:4px;justify-content:center">'
    +TUT_STARTER_DECK.map(cid=>{
      const c=CARDS.find(x=>x.id===cid);
      return `<div style="width:54px;aspect-ratio:3/4;border-radius:6px;border:1.5px solid var(--pc);position:relative;overflow:hidden;background:var(--dk3)">${cardFace(c)}</div>`;
    }).join('')
    +'</div>';
}

// ── AMBIENT MUSIC (procedural, Web Audio API, upbeat techno loop) ──
let actx=null,musicGain=null,musicMuted=false,ambient=null,noiseBuffer=null;
(()=>{try{musicMuted=localStorage.getItem('ds5_mute')==='1';}catch(e){}})();
const MUSIC_VOL=0.22;
function updateMuteBtn(){
  const b=document.getElementById('muteBtn');if(!b)return;
  const img=b.querySelector('img.ui-ic');
  if(img){
    img.src=musicMuted?UI_ICON.icon_soundoff:UI_ICON.icon_soundon;
    img.dataset.ic=musicMuted?'icon_soundoff':'icon_soundon';
    img.style.filter='none';
  }
  b.classList.toggle('off',musicMuted);
}
function toggleMute(){
  musicMuted=!musicMuted;
  if(musicGain&&actx) musicGain.gain.setTargetAtTime(musicMuted?0:MUSIC_VOL,actx.currentTime,0.15);
  updateMuteBtn();
  try{localStorage.setItem('ds5_mute',musicMuted?'1':'0');}catch(e){}
}
const NOTE_FREQ={'A2':110.00,'C3':130.81,'D3':146.83,'F#3':185.00,'G3':196.00,'A3':220.00,
  'D5':587.33,'E5':659.25,'F#5':739.99,'G5':783.99,'A5':880.00,'D6':1174.66};
function startAmbient(mode){
  mode=mode||'normal';
  if(!actx){
    actx=new (window.AudioContext||window.webkitAudioContext)();
    musicGain=actx.createGain();
    musicGain.gain.value=musicMuted?0:MUSIC_VOL;
    musicGain.connect(actx.destination);
    const len=Math.floor(actx.sampleRate*0.3);
    noiseBuffer=actx.createBuffer(1,len,actx.sampleRate);
    const d=noiseBuffer.getChannelData(0);
    for(let i=0;i<len;i++) d[i]=Math.random()*2-1;
  }
  if(actx.state==='suspended') actx.resume();
  const t0=actx.currentTime;
  musicGain.gain.cancelScheduledValues(t0);
  musicGain.gain.setValueAtTime(musicMuted?0:MUSIC_VOL,t0);
  if(ambient){
    if(ambient.mode===mode) return; // ya suena el modo correcto
    clearInterval(ambient.timer); ambient=null; // cambiar de modo
  }
  const ctx=actx,out=musicGain;
  const F=n=>440*Math.pow(2,(n-69)/12); // nota MIDI → Hz

  // pad suave: dos triángulos desafinados con filtro y envolvente lenta
  function pad(t,midi,dur,vol){
    [0,-0.07].forEach(det=>{
      const o=ctx.createOscillator();o.type='triangle';o.frequency.value=F(midi+det);
      const f=ctx.createBiquadFilter();f.type='lowpass';f.frequency.value=900;f.Q.value=0.6;
      const gn=ctx.createGain();
      gn.gain.setValueAtTime(0.0001,t);
      gn.gain.linearRampToValueAtTime(vol,t+dur*0.35);
      gn.gain.linearRampToValueAtTime(0.0001,t+dur);
      o.connect(f);f.connect(gn);gn.connect(out);
      o.start(t);o.stop(t+dur+0.05);
    });
  }
  // pluck tipo arpa: seno con ataque corto y cola suave
  function pluck(t,midi,vol){
    const o=ctx.createOscillator();o.type='sine';o.frequency.value=F(midi);
    const gn=ctx.createGain();
    gn.gain.setValueAtTime(0.0001,t);
    gn.gain.linearRampToValueAtTime(vol,t+0.012);
    gn.gain.exponentialRampToValueAtTime(0.0001,t+1.1);
    o.connect(gn);gn.connect(out);
    o.start(t);o.stop(t+1.2);
  }
  // dron grave para el Vacío
  function drone(t,midi,dur,vol){
    const o=ctx.createOscillator();o.type='sine';o.frequency.value=F(midi);
    const o2=ctx.createOscillator();o2.type='sine';o2.frequency.value=F(midi)*1.005; // batido lento
    const gn=ctx.createGain();
    gn.gain.setValueAtTime(0.0001,t);
    gn.gain.linearRampToValueAtTime(vol,t+dur*0.3);
    gn.gain.linearRampToValueAtTime(0.0001,t+dur);
    o.connect(gn);o2.connect(gn);gn.connect(out);
    o.start(t);o.stop(t+dur+0.05);o2.start(t);o2.stop(t+dur+0.05);
  }
  // oleada de "viento" (ruido filtrado) para suspenso
  function windSwell(t,dur,vol){
    const src=ctx.createBufferSource();src.buffer=noiseBuffer;src.loop=true;
    const f=ctx.createBiquadFilter();f.type='bandpass';f.frequency.value=350;f.Q.value=1.4;
    const gn=ctx.createGain();
    gn.gain.setValueAtTime(0.0001,t);
    gn.gain.linearRampToValueAtTime(vol,t+dur*0.5);
    gn.gain.linearRampToValueAtTime(0.0001,t+dur);
    src.connect(f);f.connect(gn);gn.connect(out);
    src.start(t);src.stop(t+dur+0.05);
  }

  let bar=0, timer;
  if(mode==='normal'){
    // ── Duelo normal: calmo pero con movimiento (Re mayor, 8s por vuelta) ──
    const BAR=2.0; // segundos por compás
    const prog=[[50,57,62],[45,52,57],[47,54,59],[43,50,55]]; // D — A — Bm — G (acordes en MIDI)
    const arps=[[74,78,81,86],[69,73,76,81],[71,74,78,83],[67,71,74,79]];
    function tick(){
      const t=ctx.currentTime+0.03;
      const chord=prog[bar%4], arp=arps[bar%4];
      chord.forEach(n=>pad(t,n,BAR*1.05,0.055));
      // 2-3 notas de arpa por compás, con leve variación
      const picks=(bar%2===0)?[0,2]:[1,3,(bar%8===7)?0:2];
      picks.forEach((pi,j)=>pluck(t+0.25+j*0.62,arp[pi%4],0.085));
      bar++;
    }
    tick(); timer=setInterval(tick,2000);
  }else{
    // ── Vacío: suspenso — dron grave, semitono tenso, campanas lejanas ──
    const BAR=2.4;
    function tick(){
      const t=ctx.currentTime+0.03;
      // dron alternando Re grave y Mib (semitono de tensión)
      drone(t,(bar%4<3)?38:39,BAR*1.1,0.11);
      if(bar%2===1) windSwell(t,BAR*1.4,0.045);
      // campana dissonante muy ocasional y suave
      if(bar%4===2) pluck(t+0.9,86+(bar%8===6?1:0),0.05);
      if(bar%8===5) pluck(t+1.5,74,0.04);
      bar++;
    }
    tick(); timer=setInterval(tick,2400);
  }
  ambient={timer,mode};
}
function stopAmbient(){
  if(!ambient)return;
  clearInterval(ambient.timer);
  ambient=null;
  if(actx&&musicGain){
    const t=actx.currentTime;
    musicGain.gain.cancelScheduledValues(t);
    musicGain.gain.setValueAtTime(0,t); // hard cut, kills any lingering notes instantly
    actx.suspend();
  }
}

// ── CARD FACE BUILDER (unified) ────────────────────────────────
function cardFace(c, stats, elBonus){
  const s = stats || c.stats;
  const isLeg = c.st>=5;
  const boost = elBonus===1, pen = elBonus===-1;
  const sc = boost?'stat-boost':pen?'stat-pen':'';
  // Build star display: filled vs empty, gold for legendary
  const starColor = isLeg ? '#FFD166' : '#c9930a';
  const emptyColor = 'rgba(255,255,255,.18)';
  const starHTML = Array.from({length:5},(_,i)=>
    '<span style="color:'+(i<c.st?starColor:emptyColor)+'">★</span>'
  ).join('');
  return '<div class="cv-art" style="background-image:url(\''+ART[c.art]+'\')"></div>'
    + '<div class="cv-ovl"></div>'
    + '<img class="cv-frame'+(isLeg?' legendary':'')+'" src="'+(isLeg?CARD_FRAME_LEG:CARD_FRAME)+'" alt="">'
    + '<div class="cv-banner">'+c.name+'</div>'
    + '<div class="cv-stars">'+starHTML+'</div>'
    + '<div class="cv-elem'+(boost?' elem-boost':'')+'" style="background:'+FC[c.f]+';border-color:'+FC[c.f]+';color:'+FC[c.f]+'">'+elemIcon(c.f)+'</div>'
    + '<div class="cv-top'+(sc?' '+sc:'')+'">'+fmtN(s[0])+'</div>'
    + '<div class="cv-right'+(sc?' '+sc:'')+'">'+fmtN(s[1])+'</div>'
    + '<div class="cv-bottom'+(sc?' '+sc:'')+'">'+fmtN(s[2])+'</div>'
    + '<div class="cv-left'+(sc?' '+sc:'')+'">'+fmtN(s[3])+'</div>';
}
function shuffleArr(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}

// ── ELEMENT LEGEND ────────────────────────────────────────────
function legendHTML(){
  return ELEMENTS_LIST.map(e=>'<span class="lg"><span class="lgicon" style="background:'+FC[e]+'aa;border-color:'+FC[e]+'">'+elemIcon(e)+'</span> '+ELEM_NAME[e]+'</span>').join('');
}

// ── SCREENS ───────────────────────────────────────────────────
let collSort='default'; // 'default' | 'element' | 'stars'
const SORT_LABELS={default:'Defecto',element:'Elemento',stars:'Estrellas'};
const SORT_CYCLE=['default','element','stars'];
function cycleSort(){
  const idx=SORT_CYCLE.indexOf(collSort);
  collSort=SORT_CYCLE[(idx+1)%SORT_CYCLE.length];
  document.getElementById('sortLabel').textContent=SORT_LABELS[collSort];
  renderCollectionScreen();
}
// ── PARTIDA RÁPIDA ──────────────────────────────────────────
let _qmDid=null; // oponente de la partida rápida actual

// Frases de presentación de combate por duelista
const QM_TAUNT = {
  0:  '¡Oye, oye! ¿Una partida rápida? ¡Acepto! Aunque ya sé que voy a perder...',
  1:  'El bosque me trajo hasta vos. No creo en las coincidencias.',
  2:  'Protocolo de combate iniciado. Preparate.',
  3:  'Información es poder. Y yo sé más de ti de lo que creés.',
  4:  '¡Al abordaje, sea quien sea! ¡Mi flota no teme a nadie!',
  5:  'La tormenta eligió este momento. Que comience.',
  6:  'El norte recibe a sus rivales con hierro y silencio.',
  7:  'Las sombras me mostraron tu cara antes que tú llegaras.',
  8:  'Las runas ya predicen el resultado. ¿Lo querés saber?',
  9:  'Doscientos años esperando un rival. Quizás seas tú... o no.',
  10: 'Los dioses del bosque eterno te pusieron en mi camino.',
  11: 'Mil años de oscuridad y aún aparecen desafiantes. Qué curioso.',
};

function quickMatch(){
  if(SAVE.coll.length<5){
    const ov=document.createElement('div');
    ov.style.cssText='position:fixed;inset:0;z-index:400;background:rgba(0,0,0,.8);display:flex;align-items:center;justify-content:center;';
    ov.innerHTML='<div style="background:rgba(13,27,75,.97);border:2px solid var(--gold2);border-radius:12px;padding:1.5rem;max-width:280px;text-align:center;">'
      +'<div style="font-family:Cinzel,serif;color:var(--gold);font-size:.9rem;margin-bottom:.6rem">⚡ Partida Rápida</div>'
      +'<div style="font-family:Philosopher,serif;font-size:.78rem;color:var(--td);margin-bottom:.9rem">Necesitás al menos <strong style="color:var(--gold)">5 cartas</strong> en tu colección para jugar una Partida Rápida.</div>'
      +'<button class="btn xs" onclick="this.closest(\'div\').parentNode.remove()">Entendido</button>'
      +'</div>';
    document.body.appendChild(ov);
    return;
  }

  _nextDuelCost=0; // Partida Rápida no cuesta energía
  // Elegir oponente al azar
  const available=DUELISTS.filter(d=>d.id>=0);
  const d=available[Math.floor(Math.random()*available.length)];
  _qmDid=d.id;

  // Preparar mazo (5 cartas al azar de la colección)
  const shuffled=[...SAVE.coll].sort(()=>Math.random()-.5);
  const unique=[...new Set(shuffled)].slice(0,5);
  const deck=unique.length>=5?unique:shuffled.slice(0,5);
  pendDid=d.id;
  dkSel=[...deck];

  // Mostrar pantalla de presentación del oponente
  quickMatchIntro(d);
}

function quickMatchIntro(d){
  const taunt=QM_TAUNT[d.id]||'¿Listo para el duelo?';
  const diffStars='⭐'.repeat(d.diff);
  const factionColors={fire:'#e85d04',storm:'#4895ef',nat:'#52b788',void:'#bf5fff'};
  const fc=factionColors[d.f]||'var(--gold)';

  const ov=document.createElement('div');
  ov.id='qm-intro-ov';
  ov.style.cssText='position:fixed;inset:0;z-index:450;background:rgba(0,0,0,.92);backdrop-filter:blur(8px);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1rem;padding:2rem 1.5rem;';

  ov.innerHTML=`
    <div style="font-family:'Cinzel',serif;font-size:.7rem;color:var(--gold2);letter-spacing:.2em;text-transform:uppercase;opacity:.7">⚡ Partida Rápida</div>
    <img src="${TOKEN[d.id]||PORT[d.port]}" style="width:110px;height:110px;object-fit:cover;filter:drop-shadow(0 0 20px ${fc})" alt="${d.name}">
    <div style="text-align:center;">
      <div style="font-family:'Cinzel Decorative',serif;font-size:1.1rem;color:${fc};margin-bottom:.2rem">${d.name}</div>
      <div style="font-family:'Philosopher',serif;font-size:.72rem;color:var(--td)">${d.title} &nbsp;·&nbsp; ${diffStars}</div>
    </div>
    <div style="font-family:'Philosopher',serif;font-size:.82rem;color:#ccc;text-align:center;max-width:280px;line-height:1.6;font-style:italic;border-left:2px solid ${fc};padding-left:.8rem;">
      "${taunt}"
    </div>
    <div style="display:flex;gap:.6rem;margin-top:.5rem;">
      <button class="btn xs" style="border-color:var(--td);color:var(--td);" onclick="document.getElementById('qm-intro-ov').remove();_qmDid=null;">← Volver</button>
      <button class="btn xs" style="border-color:${fc};color:${fc};" onclick="document.getElementById('qm-intro-ov').remove();showS('game-screen');startDuel();">⚔ ¡Duelo!</button>
    </div>
  `;
  document.body.appendChild(ov);
}

function quickMatchResult(win,draw){
  if(win) gainEnergy(ENERGY.qm);
  // Mostrar overlay de resultado partida rápida
  const d=DUELISTS.find(x=>x.id===_qmDid);
  const ov=document.createElement('div');
  ov.id='qm-result-ov';
  ov.style.cssText='position:fixed;inset:0;z-index:400;background:rgba(0,0,0,.85);backdrop-filter:blur(5px);display:flex;align-items:center;justify-content:center;padding:1.5rem;';
  const icon=win?'🏆':draw?'🤝':'💀';
  const title=win?'¡Victoria!':draw?'Empate':'Derrota';
  const color=win?'var(--pc)':draw?'var(--gold2)':'#e74c3c';
  ov.innerHTML=`<div style="background:linear-gradient(135deg,rgba(13,27,75,.97),rgba(7,8,15,.97));border:2px solid ${color};border-radius:14px;padding:1.5rem;max-width:300px;width:100%;text-align:center;">
    <div style="font-size:2rem;margin-bottom:.4rem">${icon}</div>
    <div style="font-family:'Cinzel',serif;font-size:1.1rem;color:${color};margin-bottom:.3rem">${title}</div>
    <div style="font-family:'Philosopher',serif;font-size:.75rem;color:var(--td);margin-bottom:1rem">vs <strong style="color:var(--gold2)">${d?d.name:'Oponente'}</strong>${win?' &nbsp;·&nbsp; <span style=\"color:#f4d35e\">+'+ENERGY.qm+' ⚡</span>':''}</div>
    <div style="display:flex;flex-direction:column;gap:.5rem;">
      <button class="btn title-btn" onclick="document.getElementById('qm-result-ov').remove();quickMatch()" style="border-color:var(--gold2);color:var(--gold2)">⚡ Otro oponente</button>
      <button class="btn title-btn" onclick="document.getElementById('qm-result-ov').remove();quickMatchRematch()" style="border-color:#f4a261;color:#f4a261">🔄 Revancha</button>
      <button class="btn title-btn" onclick="document.getElementById('qm-result-ov').remove();showS('title-screen')" style="border-color:var(--td);color:var(--td)">🏠 Inicio</button>
    </div>
  </div>`;
  document.body.appendChild(ov);
}

function quickMatchRematch(){
  // Reusar mismo oponente y mismo mazo
  _nextDuelCost=0;
  startDuel();
}
// ── FIN PARTIDA RÁPIDA ───────────────────────────────────────

function newGame(){
  const m=document.getElementById('confirmModal');
  m.style.display='flex';
}
function closeConfirm(){
  document.getElementById('confirmModal').style.display='none';
}
function confirmNewGame(){
  closeConfirm();
  SAVE.coll=[...INITIAL_COLL];
  SAVE.beaten=[];
  SAVE.cineSeen=[];
  SAVE.mp=0;
  SAVE.world=1;
  SAVE.avatar='tomas';
  SAVE.unlockedAvatars=['tomas'];
  save();
  showS('intro-screen');
  const logo=document.querySelector('.logo-img');
  if(logo) document.getElementById('intro-logo-img').src=logo.src;
}
function showIntro(){
  // Reuse logo from title screen
  const logo=document.querySelector('.logo-img');
  if(logo) document.getElementById('intro-logo-img').src=logo.src;
  // If already beaten at least one duel, skip intro and go straight to map
  if(SAVE.beaten.length>0){ showS('map-screen'); return; }
  showS('intro-screen');
}

function showS(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  // Permit body scroll on screens that may overflow
  document.body.classList.toggle('screen-scroll', id==='collection-screen'||id==='intro-screen');
  if(id!=='game-screen') stopAmbient();
  if(id==='map-screen')renderMap();
  if(id==='deck-screen')renderDeck();
  if(id==='collection-screen')renderCollectionScreen();
}

// ── MAP ───────────────────────────────────────────────────────
function hrx(hex){const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);return r+','+g+','+b;}

function renderMap(){
  document.getElementById('colcnt').textContent=SAVE.coll.length;
  updateMapAvatar();
  // Mostrar/ocultar botón de retorno al mundo 1
  updateEnergyUI();
  checkAvatarUnlocks();
  const w2btn=document.getElementById('w2-back-btn');
  if(w2btn){
    w2btn.style.display=SAVE.world>=2?'':'none';
    w2btn.textContent='← Mundo '+(SAVE.world-1);
  }
  const WORLD_TITLES={1:'⚔ Aetherion',2:'👑 El Reino Invertido',3:'🌀 El Vacío Eterno',4:'🕳 El Abismo Sin Nombre'};
  const titleEl=document.getElementById('map-world-title');
  if(titleEl) titleEl.textContent=WORLD_TITLES[SAVE.world]||WORLD_TITLES[1];
  const w1done=SAVE.beaten.filter(x=>x<=11).length;
  const w2done=SAVE.beaten.filter(x=>x>=26&&x<=33).length;
  const w3done=SAVE.beaten.filter(x=>x>=12&&x<=19).length;
  const w4done=SAVE.beaten.filter(x=>x>=20&&x<=24).length;
  const progTxt={1:w1done+'/12',2:w2done+'/8 Mundo 2',3:w3done+'/8 Mundo 3',4:w4done+'/5 Heraldos'+(SAVE.beaten.includes(25)?' · 🏆':'')};
  document.getElementById('mprog').textContent=progTxt[SAVE.world]||progTxt[1];
  document.getElementById('duel-popup').style.display='none';
  // Map image is landscape 3:2, we use W=540 H=360 to match
  const W=540, H=360;

  // Regions mapped to real locations on the fantasy map image:
  // Region 0 (Tierras del Comienzo): Center castle area - green forest lands
  // Region 1 (Castillo del Mercader): Top-right dark castle
  // Region 2 (Fortaleza del Norte): Top-left sea castle / mountain fortress
  // Region 3 (La Ciudadela Oscura): Bottom-right island dark tower
  // Mundo 2: regiones del Vacío Eterno
  const inWorld2=SAVE.world===2, inWorld3=SAVE.world===3, inWorld4=SAVE.world===4;
  const DUELISTS_ACTIVE=inWorld4?DUELISTS.filter(d=>d.world===4):inWorld3?DUELISTS.filter(d=>d.world===3):inWorld2?DUELISTS.filter(d=>d.world===2):DUELISTS.filter(d=>!d.world);
  const RMAP_BY_WORLD={
    1:[
      { stroke:'#52b788',label:{x:220,y:280},icon:'🌾',name:'Tierras del\nComienzo',pins:[{x:185,y:240},{x:220,y:235},{x:255,y:240}],reg:0},
      { stroke:'#c9930a',label:{x:415,y:140},icon:'🏰',name:'Castillo del\nMercader',pins:[{x:388,y:95},{x:422,y:88},{x:455,y:95}],reg:1},
      { stroke:'#4895ef',label:{x:100,y:115},icon:'🗡',name:'Fortaleza\ndel Norte', pins:[{x:68,y:72},{x:100,y:65},{x:132,y:72}],reg:2},
      { stroke:'#9d4edd',label:{x:435,y:315},icon:'💀',name:'La Ciudadela\nOscura', pins:[{x:405,y:272},{x:437,y:265},{x:468,y:272}],reg:3},
    ],
    2:[
      { stroke:'#e85d04',label:{x:220,y:280},icon:'👑',name:'Ecos de\nCristal',      pins:[{x:185,y:240},{x:255,y:240}],reg:10},
      { stroke:'#4895ef',label:{x:415,y:140},icon:'🏯',name:'Bastión\nQuebrado',     pins:[{x:388,y:95},{x:455,y:95}],  reg:11},
      { stroke:'#52b788',label:{x:100,y:115},icon:'⚔',name:'Vigía del\nOcaso',      pins:[{x:68,y:72},{x:132,y:72}],   reg:12},
      { stroke:'#9d4edd',label:{x:435,y:315},icon:'🔮',name:'Trono\nInvertido',      pins:[{x:405,y:272},{x:468,y:272}],reg:13},
    ],
    3:[
      { stroke:'#9d4edd',label:{x:220,y:280},icon:'👤',name:'El Espejo\nRoto',      pins:[{x:185,y:240},{x:255,y:240}],reg:4},
      { stroke:'#4895ef',label:{x:415,y:140},icon:'⛈️',name:'Cielos\nPartidos',     pins:[{x:388,y:95},{x:455,y:95}],  reg:5},
      { stroke:'#e85d04',label:{x:100,y:115},icon:'🔥',name:'Mar\nNegro',           pins:[{x:68,y:72},{x:132,y:72}],   reg:6},
      { stroke:'#ffffff',label:{x:435,y:315},icon:'🌀',name:'El\nOrigen',           pins:[{x:405,y:272},{x:468,y:272}],reg:7},
    ],
  };
  const RMAP=inWorld4?[]:(RMAP_BY_WORLD[SAVE.world]||RMAP_BY_WORLD[1]);

  // Clip paths for portraits
  let clips=DUELISTS.map(d=>`<clipPath id="pc${d.id}"><circle r="11"/></clipPath>`).join('');

  let svg=`<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="border-radius:10px;display:block;width:100%;height:auto;box-shadow:0 4px 32px rgba(0,0,0,.7)">
  <defs>
    ${clips}
    <filter id="sh"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,.8)"/></filter>
    <filter id="glow"><feGaussianBlur stdDeviation="2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="darkpin"><feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="rgba(0,0,0,.9)"/></filter>
    <radialGradient id="castleGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.85"/>
      <stop offset="55%" stop-color="#ffffff" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <style>@keyframes castle-glow-pulse{0%,100%{opacity:.55}50%{opacity:1}}</style>
  <!-- Fantasy map background image -->
  <image href="${SAVE.world===2?MAP_IMG_W3:MAP_IMG}" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice"/>
  <!-- Dark vignette overlay for depth -->
  <rect width="${W}" height="${H}" fill="none" stroke="rgba(0,0,0,0.4)" stroke-width="30"/>
  <rect x="2" y="2" width="${W-4}" height="${H-4}" fill="none" stroke="rgba(255,209,102,0.15)" stroke-width="1.5" rx="8"/>
  `;

  const REG_OFFSET={1:0,2:10,3:4};
  RMAP.forEach((reg,ri)=>{
    const regId=(REG_OFFSET[SAVE.world]||0)+ri;
    const ds=DUELISTS_ACTIVE.filter(d=>d.reg===regId);
    const prev=ri>0?DUELISTS_ACTIVE.filter(x=>x.reg===regId-1):[];
    const locked=ri>0&&!prev.every(x=>SAVE.beaten.includes(x.id));
    const dimmed=locked?0.3:1;

    // Region label now rendered inside castle SVG

    // Castle pin — one per region, opens popup with 3 duelists
    const cx=reg.label.x, cy=reg.label.y-20;
    const allBeaten=ds.every(d=>SAVE.beaten.includes(d.id));
    const castleCol=locked?'rgba(80,80,80,.4)':allBeaten?'rgba(255,255,255,.7)':reg.stroke;
    const castleOpacity=locked?0.35:1;
    const castleOnClick=locked?'':(`openCastlePopup(${ri})`);
    // Draw castle SVG shape
    const CASTLE_PREFIX={1:'w1_',2:'w3_',3:'w2_'};
    const castleImg=CASTLE_IMG[(CASTLE_PREFIX[SAVE.world]||'w1_')+ri];
    const inProgress=!locked&&!allBeaten;
    svg+=`<g transform="translate(${cx},${cy})" opacity="${castleOpacity}" ${locked?'':'style="cursor:pointer"'} onclick="${castleOnClick}">
      <ellipse cx="0" cy="16" rx="22" ry="5" fill="rgba(0,0,0,.45)"/>
      ${inProgress?`<circle cx="0" cy="-5" r="32" fill="url(#castleGlow)" style="animation:castle-glow-pulse 2.4s ease-in-out infinite"/>`:''}
      <image href="${castleImg}" x="-27" y="-32" width="54" height="54"/>
      ${locked?`<text text-anchor="middle" y="2" font-size="13">🔒</text>`:''}
      ${allBeaten?`<circle cx="17" cy="-22" r="7" fill="rgba(5,20,10,.9)" stroke="#52b788" stroke-width="1.2"/><text x="17" y="-18.5" text-anchor="middle" font-size="9" fill="#52b788" font-weight="900">✓</text>`:''}
      <text text-anchor="middle" y="29" font-family="'Cinzel',Georgia,serif" font-size="6.5" fill="${castleCol}" font-weight="bold" letter-spacing="0.2" style="text-shadow:0 1px 3px #000">${reg.name.replace('\n',' ')}</text>
    </g>`;
  });

  // ── VÓRTICE al centro del mapa cuando se derrota a Malachar ──
  const malacharBeaten=SAVE.beaten.includes(11);
  if(SAVE.world===1&&malacharBeaten){
    const vx=270, vy=185; // centro del mapa
    const pulseAnim=`
      @keyframes vortex-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
      @keyframes vortex-pulse{0%,100%{opacity:.7}50%{opacity:1}}
    `;
    svg+=`<style>${pulseAnim}</style>`;
    svg+=`<g transform="translate(${vx},${vy})" class="vortex-pin" onclick="enterWorld2()" style="cursor:pointer">
      <image href="${VORTEX_IMG}" x="-30" y="-30" width="60" height="60" style="animation:vortex-pulse 2s infinite"/>
      <text text-anchor="middle" y="-34" font-family="'Cinzel',serif" font-size="7" fill="#e0aaff" letter-spacing="0.5" style="text-shadow:0 0 8px rgba(157,78,221,.9)">El Vacío Eterno</text>
      <text text-anchor="middle" y="-25" font-family="Georgia,serif" font-size="6" fill="rgba(224,170,255,.6)">Toca para entrar</text>
    </g>`;
  }
  // ── PORTAL al Mundo 3 (El Reino Invertido) al vencer a El Origen ──
  if(SAVE.world===2&&SAVE.beaten.includes(33)){
    const bx=270, by=185;
    svg+=`<style>@keyframes bh-pulse{0%,100%{opacity:.6}50%{opacity:1}}</style>`;
    svg+=`<g transform="translate(${bx},${by})" onclick="enterWorld3()" style="cursor:pointer">
      <image href="${VORTEX_IMG}" x="-36" y="-36" width="72" height="72" style="animation:bh-pulse 1.6s infinite;filter:hue-rotate(200deg)"/>
      <text text-anchor="middle" y="-42" font-family="'Cinzel',serif" font-size="7.5" fill="#f4d35e" letter-spacing="0.5" style="text-shadow:0 0 8px rgba(244,211,94,.9)">Un reflejo del reino se abrió</text>
      <text text-anchor="middle" y="48" font-family="Georgia,serif" font-size="6" fill="rgba(224,170,255,.7)">Toca para cruzar al Reino Invertido</text>
    </g>`;
  }
  // ── AGUJERO NEGRO al vencer a El Rey Invertido (cierre del Mundo 3) ──
  if(SAVE.world===3&&SAVE.beaten.includes(19)){
    const bx=270, by=185;
    svg+=`<style>@keyframes bh-pulse{0%,100%{opacity:.6}50%{opacity:1}}</style>`;
    svg+=`<g transform="translate(${bx},${by})" onclick="enterWorld4()" style="cursor:pointer">
      <image href="${BLACKHOLE_IMG}" x="-36" y="-36" width="72" height="72" style="animation:bh-pulse 1.6s infinite"/>
      <text text-anchor="middle" y="-42" font-family="'Cinzel',serif" font-size="7.5" fill="#f4d35e" letter-spacing="0.5" style="text-shadow:0 0 8px rgba(244,211,94,.9)">Un Agujero Negro se abrió</text>
      <text text-anchor="middle" y="48" font-family="Georgia,serif" font-size="6" fill="rgba(224,170,255,.7)">Toca para cruzar el umbral</text>
    </g>`;
  }
  // ── MUNDO 4: El Abismo Sin Nombre (Heraldos Oscuros + jefe final) ──
  if(SAVE.world===4){
    const ds4=DUELISTS.filter(d=>d.world===4&&d.reg===8); // los 5 heraldos orbitan
    const done4=ds4.filter(d=>SAVE.beaten.includes(d.id)).length;
    svg+=`<rect width="${W}" height="${H}" fill="rgba(0,0,10,0.82)"/>`;
    svg+=`<style>@keyframes bh-pulse{0%,100%{opacity:.6}50%{opacity:1}}</style>`;
    ds4.forEach((d,i)=>{
      const ang=(i/5)*Math.PI*2-Math.PI/2;
      const px=270+Math.cos(ang)*105, py=185+Math.sin(ang)*88;
      const beaten=SAVE.beaten.includes(d.id);
      svg+=`<g transform="translate(${px},${py})" opacity="${beaten?1:0.55}">
        <circle r="17.5" fill="none" stroke="${beaten?'#52b788':'#9d4edd'}" stroke-width="1.5"/>
        <image href="${TOKEN[d.id]||''}" x="-16" y="-16" width="32" height="32"/>
        ${beaten?`<circle cx="12" cy="-12" r="6" fill="rgba(5,20,10,.9)" stroke="#52b788" stroke-width="1"/><text x="12" y="-9" text-anchor="middle" font-size="8" fill="#52b788" font-weight="900">✓</text>`:''}
        <text text-anchor="middle" y="30" font-family="'Cinzel',serif" font-size="5.5" fill="${beaten?'#52b788':'#c8b6e2'}">${d.name.replace('Heraldo de la ','').replace('Heraldo del ','').replace('El Heraldo ','')}</text>
      </g>`;
    });
    const allHeralds=[20,21,22,23,24].every(id=>SAVE.beaten.includes(id));
    const finalBeaten=SAVE.beaten.includes(25);
    if(!allHeralds){
      svg+=`<g transform="translate(270,185)" onclick="openCastlePopup(0)" style="cursor:pointer">
        <image href="${BLACKHOLE_IMG}" x="-45" y="-45" width="90" height="90" style="animation:bh-pulse 1.6s infinite"/>
        <text text-anchor="middle" y="-52" font-family="'Cinzel Decorative',serif" font-size="10" fill="#f4d35e" style="text-shadow:0 0 10px rgba(244,211,94,.8)">Los Heraldos Oscuros</text>
        <text text-anchor="middle" y="58" font-family="Georgia,serif" font-size="6.5" fill="#c8b6e2">${done4}/5 derrotados · Toca el agujero negro para desafiarlos</text>
      </g>`;
    }else{
      svg+=`<g transform="translate(270,185)" onclick="castleConfirm(0,25)" style="cursor:pointer">
        <image href="${BLACKHOLE_IMG}" x="-48" y="-48" width="96" height="96" style="animation:bh-pulse 1.4s infinite"/>
        <circle r="26" fill="none" stroke="${finalBeaten?'#52b788':'#f4d35e'}" stroke-width="1.6" style="animation:bh-pulse 1.4s infinite"/>
        <image href="${TOKEN[25]}" x="-24" y="-24" width="48" height="48"/>
        ${finalBeaten?`<circle cx="18" cy="-18" r="7" fill="rgba(5,20,10,.9)" stroke="#52b788" stroke-width="1.2"/><text x="18" y="-14.5" text-anchor="middle" font-size="9" fill="#52b788" font-weight="900">✓</text>`:''}
        <text text-anchor="middle" y="-56" font-family="'Cinzel Decorative',serif" font-size="10" fill="${finalBeaten?'#52b788':'#f4d35e'}" style="text-shadow:0 0 10px rgba(244,211,94,.8)">${finalBeaten?'El Vacío fue vencido':'El Vacío Encarnado'}</text>
        <text text-anchor="middle" y="62" font-family="Georgia,serif" font-size="6.5" fill="#c8b6e2">${finalBeaten?'🏆 Juego completado · Podés desafiarlo de nuevo':'⚠ El enemigo final del juego te espera'}</text>
      </g>`;
    }
  }
  svg+='</svg>';
  document.getElementById('worldmap').innerHTML=svg;
}

// ── Map zoom & pan ──────────────────────────────────────────────
var _mZ=1, _mX=0, _mY=0, _mDrag=false, _mSX=0, _mSY=0;
function _applyMap(){
  const el=document.getElementById('worldmap-inner');
  if(!el)return;
  const wrap=document.getElementById('worldmap-wrap');
  const maxX=Math.max(0,wrap.clientWidth*(_mZ-1));
  const maxY=Math.max(0,el.scrollHeight*(_mZ-1));
  _mX=Math.max(-maxX,Math.min(0,_mX));
  _mY=Math.max(-maxY,Math.min(0,_mY));
  el.style.transform=`scale(${_mZ}) translate(${_mX/_mZ}px,${_mY/_mZ}px)`;
  document.getElementById('zoomOut').disabled=(_mZ<=1);
  document.getElementById('zoomReset').disabled=(_mZ<=1);
  document.getElementById('zoomIn').disabled=(_mZ>=3);
}
function mapZoom(dir){
  if(dir===0){_mZ=1;_mX=0;_mY=0;}
  else if(dir>0){_mZ=Math.min(3,Math.round((_mZ+0.5)*10)/10);}
  else{_mZ=Math.max(1,Math.round((_mZ-0.5)*10)/10);}
  if(_mZ===1){_mX=0;_mY=0;}
  _applyMap();
}
(function(){
  let _pinchD=0,_pinchZ=1,_lastTap=0;
  const inMap=e=>{const w=document.getElementById('worldmap-wrap');return w&&w.contains(e.target);};
  function _mpDown(e){
    if(e.touches&&e.touches.length===2&&inMap(e)){
      _pinchD=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
      _pinchZ=_mZ;_mDrag=false;return;
    }
    // doble toque: acercar / restablecer
    if(e.touches&&e.touches.length===1&&inMap(e)){
      const now=Date.now();
      if(now-_lastTap<300){ _mZ=_mZ>1?1:2; if(_mZ===1){_mX=0;_mY=0;} _applyMap(); _lastTap=0; return; }
      _lastTap=now;
    }
    if(_mZ<=1)return;
    _mDrag=true;
    const p=e.touches?e.touches[0]:e;
    _mSX=p.clientX-_mX; _mSY=p.clientY-_mY;
  }
  function _mpMove(e){
    if(e.touches&&e.touches.length===2&&_pinchD>0){
      e.preventDefault();
      const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
      _mZ=Math.max(1,Math.min(3,_pinchZ*(d/_pinchD)));
      if(_mZ===1){_mX=0;_mY=0;}
      _applyMap();return;
    }
    if(!_mDrag)return;
    e.preventDefault();
    const p=e.touches?e.touches[0]:e;
    _mX=p.clientX-_mSX; _mY=p.clientY-_mSY;
    _applyMap();
  }
  function _mpUp(e){_mDrag=false;if(!e.touches||e.touches.length<2)_pinchD=0;}
  document.addEventListener('mousedown',_mpDown);
  document.addEventListener('mousemove',_mpMove,{passive:false});
  document.addEventListener('mouseup',_mpUp);
  document.addEventListener('touchstart',_mpDown,{passive:true});
  document.addEventListener('touchmove',_mpMove,{passive:false});
  document.addEventListener('touchend',_mpUp);
})();

function enterWorld2(){
  // Cinemática de entrada al mundo 2 (ahora: El Reino Invertido)
  const ov=document.createElement('div');
  ov.style.cssText='position:fixed;inset:0;z-index:500;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1.2rem;padding:2rem;';
  ov.innerHTML=`
    <div style="font-size:4rem;animation:vortex-pulse 1.5s infinite">👑</div>
    <div style="font-family:'Cinzel Decorative',serif;font-size:1.1rem;color:#e85d04;text-align:center;text-shadow:0 0 20px rgba(232,93,4,.7)">El Reino Invertido</div>
    <div style="font-family:'Philosopher',serif;font-size:.82rem;color:#ccc;text-align:center;max-width:280px;line-height:1.7;">
      Has derrotado a Lord Malachar y atravesado el velo.<br>
      <span style="color:#e0aaff">Del otro lado espera un reflejo del reino: lo que Aetherion pudo haber sido, si hubiera perdido.</span>
    </div>
    <button class="btn xs" style="border-color:#e85d04;color:#e85d04;margin-top:.5rem" onclick="this.closest('div').remove();SAVE.world=2;save();renderMap();">Cruzar el reflejo →</button>
    <button class="btn xs" style="border-color:var(--td);color:var(--td)" onclick="this.closest('div').remove()">← Volver al mapa</button>
  `;
  document.body.appendChild(ov);
}

function enterWorld3(){
  const ov=document.createElement('div');
  ov.style.cssText='position:fixed;inset:0;z-index:500;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1.2rem;padding:2rem;';
  ov.innerHTML=`
    <div style="font-size:4rem;animation:vortex-pulse 1.5s infinite">🌀</div>
    <div style="font-family:'Cinzel Decorative',serif;font-size:1.1rem;color:#bf5fff;text-align:center;text-shadow:0 0 20px rgba(157,78,221,.8)">El Vacío Eterno</div>
    <div style="font-family:'Philosopher',serif;font-size:.82rem;color:#ccc;text-align:center;max-width:290px;line-height:1.7;">
      Al caer El Rey Invertido, el reflejo mismo se rasgó.<br>
      Del otro lado espera <span style="color:#e0aaff">el Vacío Eterno</span>: aquí las reglas cambian, y los rivales son algo diferente.
    </div>
    <button class="btn xs" style="border-color:#bf5fff;color:#e0aaff;margin-top:.5rem" onclick="this.closest('div').remove();SAVE.world=3;save();renderMap();">Entrar al Vacío →</button>
    <button class="btn xs" style="border-color:var(--td);color:var(--td)" onclick="this.closest('div').remove()">← Volver al mapa</button>
  `;
  document.body.appendChild(ov);
}
function enterWorld4(){
  const ov=document.createElement('div');
  ov.style.cssText='position:fixed;inset:0;z-index:500;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1.2rem;padding:2rem;';
  ov.innerHTML=`
    <div style="font-size:4rem;animation:vortex-pulse 1.5s infinite">🕳</div>
    <div style="font-family:'Cinzel Decorative',serif;font-size:1.1rem;color:#f4d35e;text-align:center;text-shadow:0 0 20px rgba(244,211,94,.7)">El Abismo Sin Nombre</div>
    <div style="font-family:'Philosopher',serif;font-size:.82rem;color:#ccc;text-align:center;max-width:290px;line-height:1.7;">
      Al caer El Rey Invertido, hasta el reflejo se quebró del todo.<br>
      Del otro lado esperan <span style="color:#e0aaff">los Cinco Heraldos Oscuros</span>: ecos de todo lo que existió antes del reino.<br>
      <span style="color:#f4a261">Cada duelo aquí cuesta ${ENERGY.spectral} ⚡.</span>
    </div>
    <button class="btn xs" style="border-color:#f4d35e;color:#f4d35e;margin-top:.5rem" onclick="this.closest('div').remove();SAVE.world=4;save();renderMap();">Cruzar el umbral →</button>
    <button class="btn xs" style="border-color:var(--td);color:var(--td)" onclick="this.closest('div').remove()">← Volver al mapa</button>
  `;
  document.body.appendChild(ov);
}

function openCastlePopup(ri){
  const inWorld4=SAVE.world===4;
  const DUELISTS_ACTIVE=inWorld4?DUELISTS.filter(d=>d.world===4):DUELISTS.filter(d=>d.world===SAVE.world||(SAVE.world===1&&!d.world));
  const RMAP_NAMES_BY_WORLD={
    1:['Tierras del Comienzo','Castillo del Mercader','Fortaleza del Norte','La Ciudadela Oscura'],
    2:['Ecos de Cristal','Bastión Quebrado','Vigía del Ocaso','Trono Invertido'],
    3:['El Espejo Roto','Cielos Partidos','Mar Negro','El Origen'],
    4:['Los Heraldos Oscuros'],
  };
  const regName=(RMAP_NAMES_BY_WORLD[SAVE.world]||RMAP_NAMES_BY_WORLD[1])[ri]||'Región';
  const REG_OFFSET={1:0,2:10,3:4,4:8};
  const regId=(REG_OFFSET[SAVE.world]||0)+(inWorld4?0:ri);
  const ds=DUELISTS_ACTIVE.filter(d=>d.reg===regId);
  if(!ds.length) return;

  const ov=document.createElement('div');
  ov.style.cssText='position:fixed;inset:0;z-index:400;background:rgba(0,0,0,.82);backdrop-filter:blur(5px);display:flex;align-items:center;justify-content:center;padding:1rem;';

  const box=document.createElement('div');
  box.style.cssText='background:linear-gradient(135deg,rgba(13,27,75,.97),rgba(7,8,15,.97));border:2px solid rgba(255,209,102,.3);border-radius:14px;padding:1.2rem;max-width:320px;width:100%;';

  // Header
  const title=document.createElement('div');
  title.style.cssText='font-family:"Cinzel",serif;font-size:.9rem;color:var(--gold);text-align:center;margin-bottom:.8rem;letter-spacing:.1em;';
  const WORLD_ICON={1:'🏰',2:'🏰',3:'🏯',4:'🕳'};
  title.textContent=(WORLD_ICON[SAVE.world]||'🏰')+' '+regName;
  box.appendChild(title);

  // Duelists list
  ds.forEach(d=>{
    const beaten=SAVE.beaten.includes(d.id);
    const firstUnbeaten=ds.find(x=>!SAVE.beaten.includes(x.id));
    const isNext=d===firstUnbeaten;
    const locked=!beaten&&!isNext;

    const row=document.createElement('div');
    row.style.cssText=`display:flex;align-items:center;gap:.7rem;padding:.55rem .6rem;margin-bottom:.4rem;border-radius:8px;background:${beaten?'rgba(82,183,136,.1)':locked?'rgba(30,30,50,.5)':'rgba(42,79,196,.15)'};border:1px solid ${beaten?'rgba(82,183,136,.3)':locked?'rgba(80,80,80,.3)':'rgba(255,209,102,.2)'};${locked?'opacity:.4':'cursor:pointer'};`;

    // Portrait
    const img=document.createElement('img');
    img.src=TOKEN[d.id]||PORT[d.port]||'';
    img.style.cssText='width:46px;height:46px;border-radius:50%;object-fit:cover;flex-shrink:0;'+(beaten?'':locked?'filter:grayscale(1) brightness(.6);':'');
    row.appendChild(img);

    // Info
    const info=document.createElement('div');
    info.style.cssText='flex:1;min-width:0;';
    info.innerHTML=`<div style="font-family:'Cinzel',serif;font-size:.72rem;color:${beaten?'#52b788':locked?'#666':'var(--gold)'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${beaten?'✓ ':locked?'🔒 ':''}<strong>${d.name}</strong></div>`
      +`<div style="font-family:'Philosopher',serif;font-size:.62rem;color:var(--td);margin-top:.1rem">${d.title} · ${'⭐'.repeat(d.diff)}</div>`;
    row.appendChild(info);

    if(!locked){
      const btn=document.createElement('button');
      btn.className='btn xs';
      btn.style.cssText='flex-shrink:0;font-size:.6rem;padding:.2rem .5rem;'+(beaten?'border-color:rgba(255,255,255,.2);color:var(--td);':'');
      btn.textContent=beaten?'🔄 Revancha':'⚔ Duelo';
      btn.onclick=(function(_ov,_ri,_did){return function(ev){ev.stopPropagation();if(_ov.parentNode)_ov.parentNode.removeChild(_ov);castleConfirm(_ri,_did);};})(ov,ri,d.id);
      row.appendChild(btn);
    }
    if(!locked) row.onclick=(function(_ov,_ri,_did){return function(e){if(e.target!==e.currentTarget.querySelector('button')){if(_ov.parentNode)_ov.parentNode.removeChild(_ov);castleConfirm(_ri,_did);}};})(ov,ri,d.id);
    box.appendChild(row);
  });

  // Close button
  const closeBtn=document.createElement('button');
  closeBtn.className='btn xs';
  closeBtn.style.cssText='width:100%;margin-top:.5rem;border-color:rgba(255,255,255,.15);color:var(--td);';
  closeBtn.textContent='← Volver al mapa';
  closeBtn.onclick=(function(_ov){return function(){if(_ov.parentNode)_ov.parentNode.removeChild(_ov);};})(ov);
  box.appendChild(closeBtn);

  ov.appendChild(box);
  ov.onclick=e=>{if(e.target===ov&&ov.parentNode)ov.parentNode.removeChild(ov);};
  document.body.appendChild(ov);
}

// Confirmación de duelo dentro del castillo: Sí → mazo, No → vuelve a la lista
function castleConfirm(ri,did){
  const d=DUELISTS.find(x=>x.id===did);
  if(!d)return;
  const beaten=SAVE.beaten.includes(d.id);
  const cost=d.world===4?ENERGY.spectral:ENERGY.duel;
  const stars=Array(5).fill(0).map((_,i)=>'<span style="color:'+(i<d.diff?'#FFD166':'rgba(255,255,255,.15)')+'">★</span>').join('');
  const fc=FC[d.f]||'var(--gold)';
  const ov=document.createElement('div');
  ov.style.cssText='position:fixed;inset:0;z-index:410;background:rgba(0,0,0,.85);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:1rem;';
  ov.innerHTML='<div style="background:linear-gradient(135deg,rgba(13,27,75,.97),rgba(7,8,15,.97));border:2px solid '+fc+';border-radius:14px;padding:1.3rem;max-width:300px;width:100%;text-align:center;">'
    +'<img src="'+(TOKEN[d.id]||PORT[d.port]||'')+'" style="width:92px;height:92px;object-fit:cover;filter:drop-shadow(0 0 12px '+fc+'88);margin-bottom:.5rem" alt="'+d.name+'">'
    +'<div style="font-family:\'Cinzel Decorative\',serif;font-size:.95rem;color:'+fc+'">'+d.emoji+' '+d.name+'</div>'
    +'<div style="font-family:Philosopher,serif;font-size:.68rem;color:var(--td);margin:.15rem 0 .3rem">'+d.title+'</div>'
    +'<div style="font-size:.75rem;margin-bottom:.5rem">'+stars+'</div>'
    +'<div style="font-family:Philosopher,serif;font-size:.72rem;color:#ccc;font-style:italic;line-height:1.5;margin-bottom:.8rem;border-left:2px solid '+fc+';padding-left:.7rem;text-align:left">"'+d.lore+'"</div>'
    +'<div style="font-family:Cinzel,serif;font-size:.8rem;color:var(--gold);margin-bottom:.9rem">¿'+(beaten?'Revancha contra':'Enfrentar a')+' <strong>'+d.name+'</strong>?<br><span style="font-size:.62rem;color:#f4d35e">Costo: '+cost+' ⚡ &nbsp;·&nbsp; Tenés: '+(SAVE.energy||0)+' ⚡</span></div>'
    +'<div style="display:flex;gap:.6rem;justify-content:center">'
    +'<button class="btn xs" id="cc-no" style="border-color:var(--td);color:var(--td)">← No, volver</button>'
    +'<button class="btn xs" id="cc-si" style="border-color:'+fc+';color:'+fc+'">⚔ ¡Sí, al duelo!</button>'
    +'</div></div>';
  ov.querySelector('#cc-si').onclick=function(){ov.remove();openDk(did);};
  ov.querySelector('#cc-no').onclick=function(){ov.remove();openCastlePopup(ri);};
  ov.onclick=function(e){if(e.target===ov){ov.remove();openCastlePopup(ri);}};
  document.body.appendChild(ov);
}

function mapPinClick(did){
  const d=DUELISTS.find(x=>x.id===did);
  if(!d)return;
  document.getElementById('duel-popup').style.display='none';
  const beaten=SAVE.beaten.includes(d.id);
  const stars=Array(5).fill(0).map((_,i)=>'<span style="color:'+(i<d.diff?'#FFD166':'rgba(255,255,255,.15)')+'">★</span>').join('');
  document.getElementById('duel-popup-inner').innerHTML=
    `<img src="${TOKEN[d.id]||PORT[d.port]}" alt="${d.name}" style="border-radius:50%">
    <div class="popup-info">
      <div class="popup-name">${d.emoji} ${d.name}</div>
      <div class="popup-title">${d.title}</div>
      <div class="popup-stars">${stars}</div>
      <div class="popup-lore">${d.lore}</div>
    </div>
    <button class="popup-btn" onclick="openDk(${d.id})" style="border-color:${beaten?'#52b788':'var(--gold2)'};color:${beaten?'#52b788':'var(--gold)'}">${beaten?'⚔ Revancha':'⚔ Duelo'}</button>
    <button class="popup-close" onclick="document.getElementById('duel-popup').style.display='none'">✕</button>`;
  document.getElementById('duel-popup').style.display='block';
}

function openDk(did){
  pendDid=did;
  // Pre-cargar el último equipo usado (si el tutorial ya pasó y las cartas siguen en la colección)
  const tut=did===0&&!SAVE.beaten.includes(0);
  dkSel=(!tut&&Array.isArray(SAVE.lastDeck))?[...new Set(SAVE.lastDeck)].filter(cid=>SAVE.coll.includes(cid)&&CARDS.find(x=>x.id===cid)).slice(0,5):[];
  const _d=DUELISTS.find(x=>x.id===did);
  _nextDuelCost=(_d&&_d.world===4)?ENERGY.spectral:ENERGY.duel;
  const _bd=document.getElementById('btnD');
  if(_bd)_bd.innerHTML='⚔ ¡Duelo! <span style="font-size:.6rem;opacity:.85">(−'+_nextDuelCost+' ⚡)</span>';
  if(did===0&&!SAVE.beaten.includes(0)){
    dkSel=[...TUT_STARTER_DECK];
  }
  showS('deck-screen');
  // Show Tomás intro message on deck screen before game tutorial
  if(did===0&&!SAVE.beaten.includes(0)){
    setTimeout(()=>{
      tutShow([
        {
          port:'tomas',speaker:'Aldeano Tomás',
          text:'¡Ah, un viajero nuevo! Ya te armé un mazo de <strong>5 cartas</strong> para empezar — podés verlas ahí abajo. Cuando estés listo, tocá el botón <strong>⚔ ¡Duelo!</strong> para enfrentarme.',
          highlight:'#btnD',
          bottom:'4%',
          btn:'¡Entendido, vamos! →',
        }
      ], ()=>{ /* tutorial in-game will start after coin flip */ });
    }, 150);
  }
}

function renderDeck(){
  const d=DUELISTS.find(x=>x.id===pendDid);
  const isTutorial=d.id===0&&!SAVE.beaten.includes(0);
  // Scroll to duel button so it's always visible
  setTimeout(()=>{const b=document.getElementById('btnD');if(b)b.scrollIntoView({behavior:'smooth',block:'end'});},200);
  document.getElementById('dkopp').innerHTML=
    '<div class="op"><img src="'+(TOKEN[d.id]||PORT[d.port])+'" alt="'+d.name+'"></div>'
    +'<div><div class="on">'+d.name+' <span style="font-size:.72rem;color:var(--td);font-style:normal">— '+d.title+'</span></div>'
    +'<div class="os">💬 "'+d.hint+'"</div>'
        +'<div style="font-size:.62rem;color:var(--td);margin-top:.12rem;font-style:normal">'+d.lore+'</div>'
        +''
    +'</div>';
  renderSlots();renderColl();
}
function renderSlots(){
  const el=document.getElementById('dkslots');el.innerHTML='';
  for(let i=0;i<5;i++){
    const div=document.createElement('div');
    div.className='dslot'+(i<dkSel.length?' filled':'');
    if(i<dkSel.length){
      const c=CARDS.find(x=>x.id===dkSel[i]);
      div.innerHTML=cardFace(c);
      div.onclick=()=>rmDk(i);div.title='Click para quitar';div.style.cursor='pointer';
    }else{div.textContent=(i+1).toString();}
    el.appendChild(div);
  }
  document.getElementById('btnD').disabled=dkSel.length!==5;
}
function renderColl(){
  const g=document.getElementById('cgrid');g.innerHTML='';
  // orden: de peor a mejor (por estrellas y suma de valores)
  const pow=cid=>{const c=CARDS.find(x=>x.id===cid);return c?c.st*100+c.stats.reduce((a,b)=>a+b,0):0;};
  [...new Set(SAVE.coll)].sort((a,b)=>pow(a)-pow(b)).forEach(cid=>{
    const c=CARDS.find(x=>x.id===cid);if(!c)return;
    const indk=dkSel.includes(cid);
    const div=document.createElement('div');
    div.className='cc'+(indk?' indeck':'');
    div.innerHTML=cardFace(c);
    div.onclick=()=>togDk(cid);
    div.addEventListener('mouseenter',e=>tip(e,c));
    div.addEventListener('mouseleave',tipOff);
    div.addEventListener('mousemove',tipMv);
    g.appendChild(div);
  });
}
let _collTab='coll';
function switchCollTab(tab){
  _collTab=tab;
  ['coll','sell','shop'].forEach(t=>{
    const el=document.getElementById('tab-'+t);
    if(el) el.classList.toggle('active',t===tab);
  });
  // Show/hide sort bar and elem legend only for collection tab
  const showSort = tab==='coll';
  const sortBtn=document.getElementById('sortBtn');
  if(sortBtn) sortBtn.style.display=showSort?'':'none';
  document.getElementById('elemlegend').style.display=showSort?'':'none';
  renderCollectionScreen();
}

function renderCollectionScreen(){
  const g=document.getElementById('collgrid');g.innerHTML='';
  const si=document.getElementById('sell-info');
  if(si&&_collTab!=='sell')si.remove();
  const _uniq=new Set(SAVE.coll).size;
  document.getElementById('colltotal').textContent=_uniq+' / '+CARDS.length+' cartas únicas ('+SAVE.coll.length+' en total)';
  document.getElementById('elemlegend').innerHTML=legendHTML();
  document.getElementById('mp-display').textContent=(SAVE.mp||0)+' PM';
  updateEnergyUI();
  if(document.getElementById('sortLabel'))
    document.getElementById('sortLabel').textContent=SORT_LABELS[collSort];

  if(_collTab==='shop'){ renderShop(g); return; }
  if(_collTab==='sell'){ renderSell(g); return; }

  // ── COLLECTION TAB ──
  if(!SAVE.coll.length){
    g.innerHTML='<div class="collempty">Tu colección está vacía.<br>Ganá duelos para obtener cartas.</div>';
    return;
  }
  let cards=[...new Set(SAVE.coll)].map(cid=>CARDS.find(x=>x.id===cid)).filter(Boolean);
  if(collSort==='element'){
    const order=['fire','storm','nat','void'];
    cards.sort((a,b)=>order.indexOf(a.f)-order.indexOf(b.f)||b.st-a.st);
  } else if(collSort==='stars'){
    cards.sort((a,b)=>b.st-a.st);
  }
  const qty={};
  SAVE.coll.forEach(cid=>qty[cid]=(qty[cid]||0)+1);

  cards.forEach(c=>{
    const div=document.createElement('div');
    div.className='cc zoomable';
    div.innerHTML=cardFace(c);
    const count=qty[c.id]||1;
    if(count>0){
      const badge=document.createElement('div');
      badge.style.cssText='position:absolute;bottom:6%;right:5%;z-index:20;font-family:"Cinzel",serif;font-size:1.25rem;font-weight:700;color:#fff;text-shadow:0 0 8px rgba(0,0,0,1),0 0 3px rgba(0,0,0,1);pointer-events:none;line-height:1;';
      badge.textContent='×'+count;
      div.style.position='relative';
      div.appendChild(badge);
    }
    div.addEventListener('mouseenter',e=>tip(e,c));
    div.addEventListener('mouseleave',tipOff);
    div.addEventListener('mousemove',tipMv);
    div.onclick=(()=>{const _c=c;return ()=>zoomCard(_c,cards);})();
    g.appendChild(div);
  });
}

function zoomCard(c, list){
  // list = array of card objects for navigation; if omitted, no arrows
  const cards = list || [c];
  let idx = cards.findIndex(x=>x.id===c.id);
  if(idx<0) idx=0;

  const ov=document.createElement('div');
  ov.style.cssText='position:fixed;inset:0;z-index:300;background:rgba(0,0,0,.82);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;';

  function render(){
    const cur=cards[idx];
    ov.innerHTML='';
    const pane=document.createElement('div');
    pane.className='cc-zoom-pane';
    pane.onclick=e=>e.stopPropagation();

    // Card
    const cardDiv=document.createElement('div');
    cardDiv.className='cc-zoom';
    cardDiv.innerHTML=cardFace(cur);

    // Lore
    const lore=document.createElement('div');
    lore.className='cc-zoom-lore';
    lore.textContent=cur.lore;

    // Nav row
    const nav=document.createElement('div');
    nav.className='zoom-nav';

    const btnL=document.createElement('button');
    btnL.className='zoom-arrow';
    btnL.innerHTML='&#8592;';
    btnL.disabled=idx===0;
    btnL.onclick=()=>{if(idx>0){idx--;render();}};

    const counter=document.createElement('div');
    counter.className='zoom-counter';
    counter.textContent=(idx+1)+' / '+cards.length;

    const btnR=document.createElement('button');
    btnR.className='zoom-arrow';
    btnR.innerHTML='&#8594;';
    btnR.disabled=idx===cards.length-1;
    btnR.onclick=()=>{if(idx<cards.length-1){idx++;render();}};

    nav.appendChild(btnL);
    nav.appendChild(counter);
    nav.appendChild(btnR);

    const closeBtn=document.createElement('button');
    closeBtn.className='zoom-arrow';
    closeBtn.style.cssText='width:36px;height:36px;font-size:1rem;border-color:rgba(255,255,255,.2);color:rgba(255,255,255,.5);margin-top:.2rem;';
    closeBtn.innerHTML='✕';
    closeBtn.onclick=(function(_ov){return function(){if(_ov.parentNode)_ov.parentNode.removeChild(_ov);};})(ov);

    pane.appendChild(cardDiv);
    pane.appendChild(lore);
    pane.appendChild(nav);
    pane.appendChild(closeBtn);
    ov.appendChild(pane);
  }

  render();
  document.body.appendChild(ov);
}

function renderSell(g){
  const qty={};
  SAVE.coll.forEach(cid=>qty[cid]=(qty[cid]||0)+1);
  // Only show cards with duplicates
  const dups=[...new Set(SAVE.coll)].filter(cid=>qty[cid]>1).map(cid=>CARDS.find(x=>x.id===cid)).filter(Boolean);
  dups.sort((a,b)=>b.st-a.st);

  if(!dups.length){
    g.innerHTML='<div class="collempty">No tenés cartas duplicadas para vender.<br>Las copias extra aparecerán aquí.</div>';
    return;
  }
  let infoDiv=document.getElementById('sell-info');
  if(!infoDiv){
    infoDiv=document.createElement('div');
    infoDiv.id='sell-info';
    g.parentNode.insertBefore(infoDiv,g);
  }
  infoDiv.style.cssText='width:100%;text-align:center;font-family:"Philosopher",serif;font-size:.72rem;color:var(--td);margin-bottom:.5rem;line-height:1.6;';
  infoDiv.innerHTML='Tocá una carta duplicada para venderla.<br><span style="color:#e0aaff">Solo se venden las copias extra, nunca la última.</span>';

  dups.forEach(c=>{
    const extras=qty[c.id]-1;
    const val=MP_VALUE[c.st]||5;
    const div=document.createElement('div');
    div.className='cc';
    div.style.position='relative';
    div.innerHTML=cardFace(c);
    // Duplicate badge
    const dupB=document.createElement('div');
    dupB.className='dup-badge';
    dupB.textContent='×'+extras+' extra';
    div.appendChild(dupB);
    // Sell price badge
    const sellB=document.createElement('div');
    sellB.className='sell-badge';
    sellB.textContent='✨'+val+' PM';
    div.appendChild(sellB);
    div.addEventListener('mouseenter',e=>tip(e,c));
    div.addEventListener('mouseleave',tipOff);
    div.onclick=()=>confirmSell(c,val,extras);
    g.appendChild(div);
  });
}

function confirmSell(c,val,extras){
  const ov=document.createElement('div');
  ov.className='sell-confirm';
  ov.innerHTML=`<div class="sell-box">
    <h3>✨ Vender carta</h3>
    <p>¿Vendés una copia de <strong style="color:var(--gold)">${c.name}</strong>?<br>
    Recibirás <strong style="color:#e0aaff">${val} Puntos Mágicos</strong>.<br>
    <small style="color:var(--td);font-size:.65rem">Te quedan ${extras} copia${extras>1?'s':''} extra.</small></p>
    <div class="sell-actions">
      <button class="btn xs" onclick="doSell('${c.id}',${val});document.body.removeChild(this.closest('.sell-confirm'))">Vender ✨</button>
      <button class="btn xs" style="border-color:rgba(255,255,255,.2);color:var(--td)" onclick="document.body.removeChild(this.closest('.sell-confirm'))">Cancelar</button>
    </div>
  </div>`;
  document.body.appendChild(ov);
}

function doSell(cid,val){
  const i=SAVE.coll.lastIndexOf(cid);
  if(i>=0) SAVE.coll.splice(i,1);
  SAVE.mp=(SAVE.mp||0)+val;
  save();
  document.getElementById('mp-display').textContent=SAVE.mp+' PM';
  renderCollectionScreen();
}


// ── SOBRES DE CARTAS ─────────────────────────────────────────
// Probabilidad por rareza (peso relativo, no porcentaje directo).
const BOOSTER_ODDS={1:45,2:32,3:14,4:6,5:3};
const BOOSTER_PRICE=50; // ✨ PM por sobre de 3 cartas
function boosterRoll(){
  const total=Object.values(BOOSTER_ODDS).reduce((a,b)=>a+b,0);
  let r=Math.random()*total;
  for(const st of [1,2,3,4,5]){
    r-=BOOSTER_ODDS[st];
    if(r<=0){
      const pool=CARDS.filter(c=>c.st===st);
      return pool[Math.floor(Math.random()*pool.length)];
    }
  }
  return CARDS[0];
}
function buyBooster(){
  if((SAVE.mp||0)<BOOSTER_PRICE){
    showToastMsg('✨ Te faltan PM para un sobre. Vendé cartas repetidas para conseguir más.');
    return;
  }
  SAVE.mp-=BOOSTER_PRICE;
  const cards=[boosterRoll(),boosterRoll(),boosterRoll()];
  cards.forEach(c=>SAVE.coll.push(c.id));
  save();
  showBoosterReveal(cards);
  checkAvatarUnlocks();
}
function showBoosterReveal(cards){
  const ov=document.createElement('div');
  ov.id='booster-ov';
  ov.style.cssText='position:fixed;inset:0;z-index:490;background:rgba(0,0,5,.95);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:1.2rem;gap:1rem;';
  ov.innerHTML='<div style="font-family:\'Cinzel Decorative\',serif;font-size:1rem;color:#e0aaff;text-shadow:0 0 14px rgba(224,170,255,.5)">📦 ¡Sobre abierto!</div>'
    +'<div id="booster-cards" style="display:flex;gap:.6rem;justify-content:center;flex-wrap:wrap;max-width:400px;"></div>'
    +'<button class="btn sm" style="border-color:#bf5fff;color:#e0aaff" onclick="document.getElementById(\'booster-ov\').remove();renderCollectionScreen();">Continuar</button>';
  document.body.appendChild(ov);
  const wrap=document.getElementById('booster-cards');
  cards.forEach((c,i)=>{
    const back=document.createElement('div');
    back.className='hc';
    back.style.cssText='width:100px;cursor:pointer;perspective:600px;';
    back.innerHTML='<div class="ehc-back" style="position:absolute;inset:0;background-image:url(\''+CARD_BACK+'\');background-size:100% 100%;border-radius:6px;"></div>';
    back.dataset.flipped='0';
    back.onclick=function(){
      if(this.dataset.flipped==='1')return;
      this.dataset.flipped='1';
      this.innerHTML=cardFace(c);
      if(c.st>=4){ this.style.boxShadow='0 0 18px '+(FC[c.f]||'#e0aaff'); }
    };
    setTimeout(()=>back.click(), 400+i*350); // se revelan solas, en cadena
    wrap.appendChild(back);
  });
}

function renderShop(g){
  g.className='shop-grid';
  const headerDiv=document.createElement('div');
  headerDiv.style.cssText='grid-column:1/-1;text-align:center;font-family:"Philosopher",serif;font-size:.72rem;color:var(--td);line-height:1.6;margin-bottom:.3rem;';
  headerDiv.innerHTML='Cartas exclusivas que no se consiguen en duelos.<br><span style="color:#e0aaff">A mayor rareza ★, mayor costo en ✨ PM.</span>';
  g.appendChild(headerDiv);

  // ── Paquetes de energía ──
  const eWrap=document.createElement('div');
  eWrap.style.cssText='grid-column:1/-1;background:rgba(244,211,94,.06);border:1px solid rgba(244,211,94,.3);border-radius:10px;padding:.7rem;margin-bottom:.5rem;';
  const full=(SAVE.energy||0)>=ENERGY.max;
  eWrap.innerHTML='<div style="font-family:Cinzel,serif;font-size:.72rem;color:#f4d35e;text-align:center;margin-bottom:.5rem;letter-spacing:.08em">⚡ ENERGÍA &nbsp;·&nbsp; '+(SAVE.energy||0)+' / '+ENERGY.max+'</div>'
    +'<div style="display:flex;gap:.5rem;justify-content:center;flex-wrap:wrap">'
    +'<button class="btn xs" style="border-color:#f4d35e;color:#f4d35e" '+(full?'disabled':'')+' onclick="buyEnergy(5,15)">⚡ +5 &nbsp;—&nbsp; ✨ 15 PM</button>'
    +'<button class="btn xs" style="border-color:#f4d35e;color:#f4d35e" '+(full?'disabled':'')+' onclick="buyEnergy(15,40)">⚡ +15 &nbsp;—&nbsp; ✨ 40 PM</button>'
    +'</div>'
    +(full?'<div style="text-align:center;font-size:.62rem;color:var(--td);margin-top:.4rem">Energía al máximo</div>':'');
  g.appendChild(eWrap);

  // ── Sobres de cartas ──
  const bWrap=document.createElement('div');
  bWrap.style.cssText='grid-column:1/-1;background:rgba(191,95,255,.06);border:1px solid rgba(191,95,255,.3);border-radius:10px;padding:.7rem;margin-bottom:.7rem;';
  const canBuyBooster=(SAVE.mp||0)>=BOOSTER_PRICE;
  bWrap.innerHTML='<div style="font-family:Cinzel,serif;font-size:.72rem;color:#e0aaff;text-align:center;margin-bottom:.35rem;letter-spacing:.08em">📦 SOBRE DE 3 CARTAS</div>'
    +'<div style="text-align:center;font-family:Philosopher,serif;font-size:.62rem;color:var(--td);margin-bottom:.5rem">Cartas al azar de todo el juego · más chance de ★1-2, algo de suerte para ★4-5</div>'
    +'<div style="display:flex;justify-content:center">'
    +'<button class="btn xs" style="border-color:#bf5fff;color:#e0aaff" '+(canBuyBooster?'':'disabled')+' onclick="buyBooster();switchCollTab(\'shop\')">📦 Abrir sobre — ✨ '+BOOSTER_PRICE+' PM</button>'
    +'</div>';
  g.appendChild(bWrap);

  SHOP_CARDS.sort((a,b)=>a.cost-b.cost).forEach(c=>{
    const owned=SAVE.coll.includes(c.id);
    const canAfford=(SAVE.mp||0)>=c.cost;
    const div=document.createElement('div');
    div.className='shop-card'+(owned?' owned':'');
    div.innerHTML=cardFace(c);
    const priceDiv=document.createElement('div');
    priceDiv.className='shop-price '+(owned?'owned-price':canAfford?'affordable':'cant');
    if(owned){
      priceDiv.textContent='✓ En tu colección';
      priceDiv.style.color='rgba(82,183,136,.9)';
    } else {
      priceDiv.textContent='✨ '+c.cost+' PM';
      priceDiv.style.color=canAfford?'#e0aaff':'rgba(255,100,100,.7)';
    }
    div.appendChild(priceDiv);
    div.addEventListener('mouseenter',e=>tip(e,c));
    div.addEventListener('mouseleave',tipOff);
    const shopCards=SHOP_CARDS.slice().sort((a,b)=>a.cost-b.cost);
    div.onclick=(()=>{const _c=c,_owned=owned;return ()=>shopZoomCard(_c,_owned,shopCards);})();
    g.appendChild(div);
  });
}

function shopZoomCard(c, owned, list){
  let idx=list.findIndex(x=>x.id===c.id);
  if(idx<0) idx=0;
  const ov=document.createElement('div');
  ov.style.cssText='position:fixed;inset:0;z-index:300;background:rgba(0,0,0,.85);backdrop-filter:blur(5px);display:flex;align-items:center;justify-content:center;';

  function render(){
    const cur=list[idx];
    const curOwned=SAVE.coll.includes(cur.id);
    const canAfford=(SAVE.mp||0)>=cur.cost;
    ov.innerHTML='';
    const pane=document.createElement('div');
    pane.className='cc-zoom-pane';
    pane.onclick=e=>e.stopPropagation();

    const cardDiv=document.createElement('div');
    cardDiv.className='cc-zoom';
    cardDiv.innerHTML=cardFace(cur);

    // Price badge
    const priceDiv=document.createElement('div');
    priceDiv.style.cssText='font-family:Cinzel,serif;font-size:.8rem;font-weight:700;text-align:center;margin:.3rem 0;letter-spacing:.08em;';
    if(curOwned){
      priceDiv.style.color='rgba(82,183,136,.9)';
      priceDiv.textContent='✓ Ya en tu colección';
    } else {
      priceDiv.style.color=canAfford?'#e0aaff':'rgba(255,100,100,.8)';
      priceDiv.textContent='✨ '+cur.cost+' PM'+(canAfford?'':' — PM insuficientes');
    }

    const lore=document.createElement('div');
    lore.className='cc-zoom-lore';
    lore.textContent=cur.lore;

    // Nav row
    const nav=document.createElement('div');
    nav.className='zoom-nav';
    const btnL=document.createElement('button');
    btnL.className='zoom-arrow';
    btnL.innerHTML='&#8592;';
    btnL.disabled=idx===0;
    btnL.onclick=()=>{if(idx>0){idx--;render();}};
    const counter=document.createElement('div');
    counter.className='zoom-counter';
    counter.textContent=(idx+1)+' / '+list.length;
    const btnR=document.createElement('button');
    btnR.className='zoom-arrow';
    btnR.innerHTML='&#8594;';
    btnR.disabled=idx===list.length-1;
    btnR.onclick=()=>{if(idx<list.length-1){idx++;render();}};
    nav.appendChild(btnL);
    nav.appendChild(counter);
    nav.appendChild(btnR);

    // Action button
    const actionRow=document.createElement('div');
    actionRow.style.cssText='display:flex;gap:.5rem;justify-content:center;margin-top:.3rem;';
    const closeBtn=document.createElement('button');
    closeBtn.className='zoom-arrow';
    closeBtn.style.cssText='width:36px;height:36px;font-size:1rem;border-color:rgba(255,255,255,.2);color:rgba(255,255,255,.5);';
    closeBtn.innerHTML='✕';
    closeBtn.onclick=(function(_ov){return function(){if(_ov.parentNode)_ov.parentNode.removeChild(_ov);};})(ov);
    if(!curOwned && canAfford){
      const buyBtn=document.createElement('button');
      buyBtn.className='btn xs';
      buyBtn.style.cssText='border-color:#bf5fff;color:#e0aaff;';
      buyBtn.textContent='✨ Comprar';
      buyBtn.onclick=()=>{document.body.removeChild(ov);confirmBuy(cur);};
      actionRow.appendChild(buyBtn);
    }
    actionRow.appendChild(closeBtn);

    pane.appendChild(cardDiv);
    pane.appendChild(priceDiv);
    pane.appendChild(lore);
    pane.appendChild(nav);
    pane.appendChild(actionRow);
    ov.appendChild(pane);
  }

  render();
  document.body.appendChild(ov);
}

function confirmBuy(c){
  const canAfford=(SAVE.mp||0)>=c.cost;
  if(!canAfford){
    const ov=document.createElement('div');
    ov.className='sell-confirm';
    ov.innerHTML=`<div class="sell-box">
      <h3 style="color:#ff6b6b">✨ PM insuficientes</h3>
      <p>Necesitás <strong style="color:#e0aaff">${c.cost} PM</strong> para obtener <strong style="color:var(--gold)">${c.name}</strong>.<br>
      Tenés <strong style="color:#e0aaff">${SAVE.mp||0} PM</strong> actualmente.<br>
      <small style="color:var(--td);font-size:.65rem">Vendé cartas duplicadas para acumular más PM.</small></p>
      <div class="sell-actions">
        <button class="btn xs" onclick="document.body.removeChild(this.closest('.sell-confirm'))">Entendido</button>
      </div>
    </div>`;
    document.body.appendChild(ov);
    return;
  }
  const ov=document.createElement('div');
  ov.className='sell-confirm';
  ov.innerHTML=`<div class="sell-box">
    <h3>✨ Obtener carta</h3>
    <p>¿Usás <strong style="color:#e0aaff">${c.cost} PM</strong> para obtener<br><strong style="color:var(--gold)">${c.name}</strong>?</p>
    <div class="sell-actions">
      <button class="btn xs" onclick="doBuy('${c.id}',${c.cost});document.body.removeChild(this.closest('.sell-confirm'))">Obtener ✨</button>
      <button class="btn xs" style="border-color:rgba(255,255,255,.2);color:var(--td)" onclick="document.body.removeChild(this.closest('.sell-confirm'))">Cancelar</button>
    </div>
  </div>`;
  document.body.appendChild(ov);
}

function doBuy(cid,cost){
  SAVE.mp=Math.max(0,(SAVE.mp||0)-cost);
  SAVE.coll.push(cid);
  save();
  document.getElementById('mp-display').textContent=SAVE.mp+' PM';
  renderCollectionScreen();
}
function togDk(cid){const i=dkSel.indexOf(cid);if(i>=0)dkSel.splice(i,1);else if(dkSel.length<5)dkSel.push(cid);renderSlots();renderColl();}
function rmDk(i){dkSel.splice(i,1);renderSlots();renderColl();}

// ── DUEL START ────────────────────────────────────────────────
function startDuel(){
  if(dkSel.length!==5)return;
  const d=DUELISTS.find(x=>x.id===pendDid);
  // ── Cobro de energía ──
  SAVE.lastDeck=[...dkSel]; save(); // recordar el equipo elegido
  const _cost=(_nextDuelCost==null)?((d&&d.world===4)?ENERGY.spectral:ENERGY.duel):_nextDuelCost;
  _nextDuelCost=null;
  if(_cost>0){
    if((SAVE.energy||0)<_cost){ showNoEnergy(_cost); return; }
    SAVE.energy-=_cost; save(); updateEnergyUI();
  }
  // Random elemental terrain: 2-4 cells get an element
  const cellEl=Array(9).fill(null);
  const idxs=shuffleArr([0,1,2,3,4,5,6,7,8]);
  const numElem=2+Math.floor(Math.random()*3);
  for(let i=0;i<numElem;i++) cellEl[idxs[i]]=ELEMENTS_LIST[Math.floor(Math.random()*ELEMENTS_LIST.length)];

  // Variación aleatoria del mazo enemigo: reemplaza 1-2 cartas por otras de facción y NIVEL similar
  const ehBase=[...d.cards];
  const swapCount=Math.random()<0.5?1:2;
  const _sts=ehBase.map(id=>CARDS.find(x=>x.id===id)?.st||1);
  const _stMin=Math.max(1,Math.min(..._sts)-1), _stMax=Math.max(..._sts); // techo: nunca más fuerte que su mejor carta
  const pool=CARDS.filter(c=>c.f===d.f && !ehBase.includes(c.id) && c.st>=_stMin && c.st<=_stMax && !SHOP_CARDS.some(s=>s.id===c.id));
  if(pool.length>=swapCount){
    const shuffledPool=pool.sort(()=>Math.random()-.5);
    const indices=[...Array(5).keys()].sort(()=>Math.random()-.5).slice(0,swapCount);
    indices.forEach((i,j)=>{ ehBase[i]=shuffledPool[j].id; });
  }
  G={board:Array(9).fill(null),cellEl,ph:[...dkSel],eh:ehBase,sel:null,turn:'player',over:false,ps:5,es:5,did:pendDid};
  document.getElementById('elabel').textContent=d.emoji+' '+d.name;
  document.getElementById('dbanner').innerHTML=
    '<div class="dbanner">'
    +'<button class="duel-action-btn" id="muteBtn" onclick="toggleMute()" title="Música" style="margin-right:.6rem"><img class="ui-ic" data-ic="icon_soundon" src="'+UI_ICON.icon_soundon+'"></button>'
    +'<div class="dbside">'
    +'<div class="dbport" style="border-color:var(--pc)"><img src="'+PORT['tomas']+'" alt="Tú"></div>'
    +'<div class="dbname" style="color:var(--pc)">Tú</div></div>'
    +'<div class="dbvs">VS</div>'
    +'<div class="dbside" style="flex-direction:row-reverse">'
    +'<div class="dbport" style="border-color:var(--ec)"><img src="'+(TOKEN[d.id]||PORT[d.port])+'" alt="'+d.name+'"></div>'
    +'<div class="dbname" style="color:var(--ec)">'+d.name+'</div></div>'
    +'<button class="duel-action-btn" id="surrenderBtn" onclick="confirmSurrender()" title="Rendirse" style="margin-left:.6rem">🏳</button><button class="duel-action-btn" id="mpLeaveBtn" onclick="mpConfirmLeave()" title="Salir del duelo online" style="display:none;margin-left:.35rem">🚪</button>'
    +'</div>';
  document.getElementById('elemlegend2').innerHTML=legendHTML();
  showS('game-screen');
  const _musicMode=(d&&d.world===4)?'void':'normal';
  startAmbient(_musicMode);updateMuteBtn();
  clearLog();addLog('⚔ Duelo contra '+d.name+' — ¡Que comience!','ls');
  chatReset();
  setTimeout(()=>chatEnemyMsg('greet'),1200);
  if(numElem>0) addLog('✦ El tablero tiene '+numElem+' casilla(s) con elementos. ¡Aprovechalas!','lel');
  render();
  flipCoin(d);
}
function flipCoin(d){
  const ov=document.getElementById('coinov');
  const coin=document.getElementById('coinEl');
  const resEl=document.getElementById('coinResultText');
  const logoImg=document.getElementById('coinLogoImg');
  logoImg.src=document.querySelector('.logo-img').src;

  resEl.textContent='';resEl.classList.remove('show');
  coin.style.transition='none';coin.style.transform='rotateY(0deg)';
  void coin.offsetWidth; // force reflow
  coin.style.transition='transform 1.7s cubic-bezier(.21,.98,.32,1.18)';
  ov.classList.add('active');

  const isCara=Math.random()<0.5;
  G.turn=isCara?'player':'enemy';
  render();
  const spins=4;
  const endRot=spins*360+(isCara?0:180);
  requestAnimationFrame(()=>{ coin.style.transform='rotateY('+endRot+'deg)'; });

  setTimeout(()=>{
    if(isCara){
      resEl.textContent='¡Cara! Empezás tú.';
      addLog('🪙 ¡Cara! El logo de Darkspell decide que empezás tú.','lf');
    }else{
      resEl.textContent='¡Cruz! Empieza '+d.name+'.';
      addLog('🪙 ¡Cruz! '+d.name+' tiene el primer turno.','le');
    }
    resEl.classList.add('show');
  },1750);

  setTimeout(()=>{
    ov.classList.remove('active');
    if(G.did===0&&!SAVE.beaten.includes(0)){
      tutShow(buildTutorialSteps(),()=>{
        if(G.turn==='enemy') setTimeout(aiTurn,700);
      });
    } else {
      if(G.turn==='enemy'){ setTimeout(aiTurn,700); }
    }
  },2900);
}
function rematch(){
  document.getElementById('resov').classList.remove('active');
  _nextDuelCost=ENERGY.rematch; // revancha con descuento
  startDuel();
}
function goMap(){
  document.getElementById('resov').classList.remove('active');
  if(G.pendingCine!==null&&G.pendingCine!==undefined){
    showCinematic(G.pendingCine);
    G.pendingCine=null;
  }else{
    showS('map-screen');
  }
}
function continueNext(){
  document.getElementById('resov').classList.remove('active');
  const d=DUELISTS.find(x=>x.id===G.did);
  if(!d) return showS('map-screen');
  const next=DUELISTS.find(x=>x.id===d.id+1);
  if(!next||next.reg!==d.reg) return showS('map-screen'); // region change goes to map
  openDk(next.id);
}
function showCinematic(regionIdx){
  const c=CINE_DATA[regionIdx];if(!c)return;showS('cinematic-screen');
  document.getElementById('cineImg').src=c.art?ART[c.art]:CINE_IMG[c.img];
  document.getElementById('cineTitle').textContent=c.title;
  document.getElementById('cineText').textContent=c.text;
  if(!SAVE.cineSeen.includes(regionIdx)){SAVE.cineSeen.push(regionIdx);save();}
}
function closeCinematic(){showS('map-screen');}

// ── RENDER ────────────────────────────────────────────────────
function render(){renderBoard();renderPH();renderEH();renderScore();renderTurn();}
function renderScore(){document.getElementById('sp').textContent=G.ps;document.getElementById('se').textContent=G.es;}
function renderTurn(){
  const b=document.getElementById('tbadge');
  if(G.over){b.textContent='Fin';b.className='tbadge tbd';return;}
  if(G.turn==='player'){b.textContent='Tu turno';b.className='tbadge tbp';}
  else{b.innerHTML='Enemigo <span class="dots"><span>.</span><span>.</span><span>.</span></span>';b.className='tbadge tbe';}
}
function renderBoard(){
  const gr=document.getElementById('board');gr.innerHTML='';
  for(let i=0;i<9;i++){
    const cell=document.createElement('div');
    cell.className='cell';cell.dataset.i=i;
    if(G.board[i]){
      const bc=G.board[i];const c=CARDS.find(x=>x.id===bc.cid);
      cell.classList.add('occ',bc.o===0?'po':'eo');
      cell.innerHTML=buildBC(c,bc);
    }else{
      if(G.turn==='player'&&G.sel!==null&&!G.over){
        cell.classList.add('cp');
        cell.innerHTML='<div class="hint">+</div>';
        cell.addEventListener('click',()=>placeCard(i));
      }else{cell.innerHTML='<div class="hint">·</div>';}
      if(G.cellEl[i]){
        cell.innerHTML+='<div class="cell-elem" style="color:'+FC[G.cellEl[i]]+'">'+elemIcon(G.cellEl[i],52)+'</div>';
      }
    }
    gr.appendChild(cell);
  }
  // attach tooltip listeners to occupied cells
  gr.querySelectorAll('.cell.occ').forEach((cell,idx)=>{
    const ci=parseInt(cell.dataset.i);
    const bc=G.board[ci];
    const c=CARDS.find(x=>x.id===bc.cid);
    cell.addEventListener('mouseenter',e=>tip(e,c));
    cell.addEventListener('mouseleave',tipOff);
    cell.addEventListener('mousemove',tipMv);
    cell.style.cursor='zoom-in';
    cell.addEventListener('click',()=>duelZoom(ci,null));
  });
}
function buildBC(c,bc){
  let cls='bc';
  if(bc.elBonus===1) cls+=' eboost';
  else if(bc.elBonus===-1) cls+=' epen';
  let extra='';
  if(bc.cellElAtPlacement){
    extra='<div class="cv-terrain">'+elemIcon(bc.cellElAtPlacement)+'</div>';
  }
  return '<div class="'+cls+'">'+cardFace(c,bc.stats,bc.elBonus)+extra+'</div>';
}
function buildHC(c){
  return cardFace(c);
}
function renderPH(){
  const h=document.getElementById('phand');h.innerHTML='';
  G.ph.forEach((cid,i)=>{
    const c=CARDS.find(x=>x.id===cid);
    const el=document.createElement('div');
    el.className='hc'+(i===G.sel?' sel':'')+(G.turn==='player'?' play':'');
    el.innerHTML=buildHC(c);
    el.onclick=()=>selCard(i);
    el.addEventListener('mouseenter',e=>tip(e,c));
    el.addEventListener('mouseleave',tipOff);
    el.addEventListener('mousemove',tipMv);
    h.appendChild(el);
  });
}
function renderEH(){
  const h=document.getElementById('ehand');h.innerHTML='';
  const d=DUELISTS.find(x=>x.id===G.did);
  const portUrl=d?PORT[d.port]:(G.online?(MP.oppTok||TOKEN.unknown):'');
  G.eh.forEach(()=>{
    const el=document.createElement('div');el.className='hc ehc';
    const tokUrl=(d&&(TOKEN[d.id]||PORT[d.port]))||portUrl;
    el.innerHTML='<div class="ehc-back" style="background-image:url(\''+CARD_BACK+'\')"></div>'
      +'<div class="ehc-tok"><img src="'+tokUrl+'" alt=""></div>'
      +(d?'<div class="ehc-lbl">'+d.name+'</div>':(G.online?'<div class="ehc-lbl">Rival</div>':''));
    h.appendChild(el);
  });
}

// ── LOGIC ─────────────────────────────────────────────────────
function selCard(i){
  if(G.turn!=='player'||G.over){ duelZoom(null,i); return; }   // turno enemigo o fin: solo mirar
  if(G.sel===i){ duelZoom(null,i); return; }                    // ya seleccionada: ver en grande
  G.sel=i;renderPH();renderBoard();
}

// ── ZOOM DE CARTA EN DUELO ───────────────────────────────────
// duelZoom(ci,null) = carta del tablero en celda ci · duelZoom(null,hi) = carta i de tu mano
function duelZoom(ci,hi){
  tipOff();
  let c,stats,elBonus=0,ownerTag='',terrainNote='';
  if(ci!==null){
    const bc=G.board[ci]; if(!bc)return;
    c=CARDS.find(x=>x.id===bc.cid);
    stats=bc.stats; elBonus=bc.elBonus||0;
    ownerTag=bc.o===0?'<span style="color:var(--pc)">◉ En tu poder</span>':'<span style="color:var(--ec)">◉ Del enemigo</span>';
    if(bc.cellElAtPlacement){
      const same=c.f===bc.cellElAtPlacement;
      terrainNote='Casilla '+elemIcon(bc.cellElAtPlacement,38)+' → '+(elBonus>0?'<span style="color:#52b788">+1 a todos sus valores</span>':elBonus<0?'<span style="color:#e74c3c">−1 a todos sus valores</span>':'sin efecto');
      void same;
    }
  }else{
    const cid=G.ph[hi]; if(cid===undefined)return;
    c=CARDS.find(x=>x.id===cid);
    stats=null;
    ownerTag=(G.sel===hi)?'<span style="color:var(--gold)">✦ Seleccionada para jugar</span>':'';
  }
  const fc=FC[c.f]||'var(--gold)';
  const ov=document.createElement('div');
  ov.id='duel-zoom-ov';
  ov.style.cssText='position:fixed;inset:0;z-index:460;background:rgba(0,0,0,.88);backdrop-filter:blur(6px);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.8rem;padding:1.5rem;';
  const wrap=document.createElement('div');
  wrap.style.cssText='width:min(210px,62vw);aspect-ratio:3/4;position:relative;flex-shrink:0;filter:drop-shadow(0 0 22px '+fc+'55);';
  wrap.innerHTML=cardFace(c,stats,elBonus);
  ov.appendChild(wrap);
  const info=document.createElement('div');
  info.style.cssText='text-align:center;max-width:290px;';
  info.innerHTML=(ownerTag?'<div style="font-family:Cinzel,serif;font-size:.68rem;margin-bottom:.35rem">'+ownerTag+'</div>':'')
    +(terrainNote?'<div style="font-family:Philosopher,serif;font-size:.68rem;color:var(--td);margin-bottom:.35rem">'+terrainNote+'</div>':'')
    +'<div style="font-family:Philosopher,serif;font-size:.74rem;color:var(--td);font-style:italic;line-height:1.5">"'+c.lore+'"</div>';
  ov.appendChild(info);
  const btns=document.createElement('div');
  btns.style.cssText='display:flex;gap:.6rem;margin-top:.2rem;';
  let bHtml='<button class="btn xs" id="dz-close" style="border-color:var(--gold2);color:var(--gold)">✕ Cerrar y seguir</button>';
  if(hi!==null&&G.sel===hi&&G.turn==='player'&&!G.over)
    bHtml+='<button class="btn xs" id="dz-unsel" style="border-color:var(--td);color:var(--td)">Quitar selección</button>';
  btns.innerHTML=bHtml;
  ov.appendChild(btns);
  ov.querySelector('#dz-close').onclick=()=>ov.remove();
  const us=ov.querySelector('#dz-unsel');
  if(us)us.onclick=()=>{G.sel=null;renderPH();renderBoard();ov.remove();};
  ov.onclick=e=>{if(e.target===ov)ov.remove();};
  document.body.appendChild(ov);
}

function effectiveStats(card, ci){
  const cellEl=G.cellEl[ci];
  if(!cellEl) return {stats:[...card.stats],elBonus:0,cellEl:null};
  if(card.neutral) return {stats:[...card.stats],elBonus:0,cellEl}; // inmune al terreno: no gana ni pierde
  if(cellEl===card.f) return {stats:card.stats.map(v=>Math.min(10,v+1)),elBonus:1,cellEl};
  return {stats:card.stats.map(v=>Math.max(0,v-1)),elBonus:-1,cellEl};
}

function placeCard(ci){
  if(G.turn!=='player'||G.sel===null||G.over||G.board[ci])return;
  const cid=G.ph[G.sel];G.ph.splice(G.sel,1);G.sel=null;
  placeCapture(ci,cid,0);
  const c=CARDS.find(x=>x.id===cid);
  addLog('Jugás '+c.name+' en posición '+(ci+1),'lp');
  const eb=G.board[ci].elBonus;
  if(eb===1) addLog('✦ ¡Bono elemental de '+ELEM_NAME[G.board[ci].cellElAtPlacement]+'! +1 a todos los valores.','lel');
  else if(eb===-1) addLog('✦ Penalización elemental ('+ELEM_NAME[G.board[ci].cellElAtPlacement]+'). -1 a todos los valores.','lel');
  const cellEl=document.querySelector('.cell[data-i="'+ci+'"]');
  if(cellEl){const bcEl=cellEl.querySelector('.bc');if(bcEl)bcEl.classList.add('place');}
  recalc();render();
  // Enviar la jugada SIEMPRE antes de chequear el fin de partida: si esta es
  // la jugada 9 que llena el tablero, gameOver() corta con return más abajo
  // y el rival nunca se enteraría de la última carta si el envío fuera después.
  if(G.online) mpSend({t:'move',ci,cid});
  if(gameOver())return;
  G.turn='enemy';renderTurn();
  if(!G.online){ setTimeout(aiTurn,900); }
}

function placeCapture(ci,cid,owner){
  const c=CARDS.find(x=>x.id===cid);
  const eff=effectiveStats(c,ci);
  G.board[ci]={cid,o:owner,origin:owner,stats:eff.stats,elBonus:eff.elBonus,cellElAtPlacement:eff.cellEl};
  const opp=owner===0?1:0;
  [[0,2,ci-3,ci>=3],[1,3,ci+1,ci%3!==2],[2,0,ci+3,ci<6],[3,1,ci-1,ci%3!==0]]
    .forEach(([d,od,ni,v])=>{
      if(!v)return;const nb=G.board[ni];if(!nb||nb.o!==opp)return;
      if(G.board[ci].stats[d]>nb.stats[od]){
        nb.o=owner;
        setTimeout(()=>{
          const ce=document.querySelector('.cell[data-i="'+ni+'"]');
          if(ce){const bcE=ce.querySelector('.bc');if(bcE){bcE.classList.remove('flip');void bcE.offsetWidth;bcE.classList.add('flip');setTimeout(()=>bcE.classList.remove('flip'),600);}
          const r=ce.getBoundingClientRect();void r;}
        },80);
        const nc=CARDS.find(x=>x.id===nb.cid);
        addLog((owner===0?'Capturás ':'Enemigo captura ')+nc.name+'!',owner===0?'lf':'le');
    if(owner===1&&Math.random()<0.5) chatEnemyMsg('capture');
      }
    });
}

function recalc(){let p=0,e=0;G.board.forEach(c=>{if(!c)return;c.o===0?p++:e++;});G.ps=p+G.ph.length;G.es=e+G.eh.length;}

function gameOver(){
  if(G.board.filter(Boolean).length<9)return false;
  G.over=true;
  setTimeout(()=>chatEnemyMsg(win?'end_lose':'end_win'),600);
  let p=0,e=0;G.board.forEach(c=>{if(!c)return;c.o===0?p++:e++;});
  const d=DUELISTS.find(x=>x.id===G.did);
  const win=p>e,draw=p===e;
  const capturedCards=G.board.filter(c=>c&&c.origin===1&&c.o===0).map(c=>c.cid);
  // Victoria perfecta: TODAS las cartas que jugó el enemigo terminaron siendo tuyas
  const enemyPlayed=G.board.filter(c=>c&&c.origin===1);
  G.perfectWin=win&&enemyPlayed.length>0&&enemyPlayed.every(c=>c.o===0)&&!(_qmDid!==null&&G.did===_qmDid);
  if(G.perfectWin){ capturedCards.forEach(cid=>SAVE.coll.push(cid)); save(); }
  const wasTutorial=win&&d&&d.id===0&&!SAVE.beaten.includes(0);
  G.pendingCine=null;
  if(win&&d){
    if(!SAVE.beaten.includes(d.id)){SAVE.beaten.push(d.id);save();}
    const regionDuelists=DUELISTS.filter(x=>x.reg===d.reg);
    const allBeaten=regionDuelists.every(x=>SAVE.beaten.includes(x.id));
    if(allBeaten&&CINE_DATA[d.reg]&&!SAVE.cineSeen.includes(d.reg)) G.pendingCine=d.reg;
    // Recompensa de energía (los duelos de Partida Rápida la dan aparte)
    G.energyGain=(_qmDid!==null&&G.did===_qmDid)?0:ENERGY.win;
    if(G.energyGain) gainEnergy(G.energyGain);
    // estadísticas para logros
    SAVE.stats=SAVE.stats||{duelsWon:0,qmWins:0,mpGames:0};
    if(_qmDid!==null&&G.did===_qmDid){SAVE.stats.qmWins=(SAVE.stats.qmWins||0)+1;}
    else{SAVE.stats.duelsWon=(SAVE.stats.duelsWon||0)+1;}
    save();
  }else if(G.online){
    // Duelo online: cuenta para el logro de multijugador y da energía si ganás
    SAVE.stats=SAVE.stats||{duelsWon:0,qmWins:0,mpGames:0};
    SAVE.stats.mpGames=(SAVE.stats.mpGames||0)+1;
    if(win){ G.energyGain=ENERGY.win; gainEnergy(ENERGY.win); }
    save();
  }
  if(win&&capturedCards.length>0) setTimeout(()=>celebFX(),300);
  setTimeout(()=>showResult(win,draw,p,e,capturedCards,wasTutorial),600);
  render();return true;
}

function showResult(win,draw,p,e,capturedCards,wasTutorial){
  // Partida Rápida: no hay recompensa, mostrar overlay propio
  if(_qmDid!==null && G.did===_qmDid && !wasTutorial){
    _qmDid=null;
    quickMatchResult(win,draw);
    return;
  }
  const d=DUELISTS.find(x=>x.id===G.did);
  const riEl=document.getElementById('ri');
  if(!win&&!draw&&d){
    // Derrota: mostrar el token del duelista que te venció
    const tok=TOKEN[d.id]||PORT[d.port]||'';
    riEl.innerHTML='<img src="'+tok+'" style="width:110px;height:110px;object-fit:cover;border-radius:50%;filter:drop-shadow(0 0 14px rgba(232,93,4,.55));" alt="'+d.name+'">';
  } else {
    riEl.textContent=win?'🏆':draw?'⚖️':'💀';
  }
  const t=document.getElementById('rt');
  t.textContent=win?'¡Victoria!':draw?'Empate':'Derrota';
  t.className='rt '+(win?'win':draw?'draw':'lose');
  document.getElementById('rs').textContent=p+' — '+e;
  let sub=win
    ?(d?'"'+d.name+'" ha sido derrotado.':"¡Ganaste!")
    :draw?'Las fuerzas están equilibradas.'
    :(d?(d.defeat?'"'+d.name+'" dice: "'+d.defeat+'"':'"'+d.name+'" dice: "Vuelve cuando seas digno."'):"Debes intentarlo de nuevo.");
  if(win&&capturedCards.length===0 && !(d&&d.id===0)) sub+=' No capturaste ninguna carta enemiga esta vez.';
  if(win&&d&&d.id===24) sub='El último Heraldo Oscuro se disuelve... pero el agujero negro late con más fuerza que nunca. Algo antiguo abre los ojos en el centro del Abismo. 🕳';
  if(win&&d&&d.id===33) sub='El Rey Invertido se astilla como el cristal que gobernaba. El reflejo se rasga por completo, y detrás de él se abre un vacío que no tiene fondo. 🌀';
  if(win&&d&&d.id===25) sub='El Vacío Encarnado se apaga como una vela. Aetherion, el Vacío Eterno y todo lo que existió antes quedan en paz. Tu nombre es leyenda. 🏆 ¡JUEGO COMPLETADO!';
  if(G.perfectWin) sub='⭐ ¡VICTORIA PERFECTA! Convertiste todas las cartas enemigas: te quedás con TODAS como botín. '+sub;
  if(win&&G.energyGain) sub+=' Recuperás +'+G.energyGain+' ⚡.';
  document.getElementById('rsub').textContent=sub;
  // First win vs Tomás: give starter deck instead of normal capture reward
  if(wasTutorial){
    tutorialReward();
  }else{
    renderRewardChoice(win?capturedCards:[]);
  }
  // Show Continue button if there's a next duelist in same region
  const d2=DUELISTS.find(x=>x.id===G.did);
  const next=d2?DUELISTS.find(x=>x.id===d2.id+1):null;
  const showCont=win&&next&&next.reg===d2.reg&&!SAVE.beaten.includes(next.id);
  document.getElementById('btnRematch').style.display=G.online?'none':'';
  document.getElementById('btnMapa').style.display=G.online?'none':'';
  document.getElementById('btnContinue').style.display=(!G.online&&showCont)?'':'none';
  document.getElementById('btnMpExit').style.display=G.online?'':'none';
  const tradeBtn=document.getElementById('btnMpTrade');
  if(tradeBtn) tradeBtn.style.display=(G.online&&MP.conn&&MP.conn.open)?'':'none';
  const rematchBtn=document.getElementById('btnMpRematch');
  if(rematchBtn) rematchBtn.style.display=(G.online&&MP.conn&&MP.conn.open)?'':'none';
  stopAmbient();
  document.getElementById('resov').classList.add('active');
}

function renderRewardChoice(cardIds){
  const box=document.getElementById('rrew');
  const content=document.getElementById('rrewd');
  content.innerHTML='';content.className='';
  if(!cardIds.length){box.style.display='none';return;}
  box.style.display='block';
  // Victoria perfecta: ya se otorgaron todas, solo mostrarlas
  if(G&&G.perfectWin){
    document.getElementById('rrewt').textContent='⭐ ¡VICTORIA PERFECTA! Todas estas cartas son tuyas:';
    content.className='reward-grid';
    cardIds.forEach(cid=>{
      const c=CARDS.find(x=>x.id===cid);
      const div=document.createElement('div');
      div.className='rcard';
      div.style.cssText='position:relative;outline:2px solid #52b788;border-radius:8px;';
      div.innerHTML=cardFace(c);
      content.appendChild(div);
    });
    return;
  }
  document.getElementById('rrewt').textContent='🏆 ¡Elegí UNA carta capturada para quedártela!';
  content.className='reward-grid';
  let markedCid=null;

  function renderCards(){
    content.innerHTML='';
    cardIds.forEach(cid=>{
      const c=CARDS.find(x=>x.id===cid);
      const isNew=!SAVE.coll.includes(cid);
      const div=document.createElement('div');
      div.className='rcard';
      div.style.position='relative';
      div.innerHTML=cardFace(c);
      if(isNew){
        const badge=document.createElement('div');
        badge.style.cssText='position:absolute;bottom:22%;left:50%;transform:translateX(-50%);z-index:20;background:linear-gradient(135deg,#52b788,#40916c);color:#fff;font-family:\'Cinzel\',serif;font-size:.6rem;font-weight:700;letter-spacing:.12em;padding:3px 10px;border-radius:20px;box-shadow:0 0 10px rgba(82,183,136,.6);pointer-events:none;white-space:nowrap;text-transform:uppercase;';
        badge.textContent='✦ Nueva';
        div.appendChild(badge);
      }
      div.addEventListener('mouseenter',e=>tip(e,c));
      div.addEventListener('mouseleave',tipOff);
      div.addEventListener('mousemove',tipMv);
      div.onclick=()=>showRewardZoom(cid);
      content.appendChild(div);
    });
    const hint=document.createElement('div');
    hint.style.cssText='width:100%;margin-top:.5rem;text-align:center;font-size:.65rem;color:var(--td);';
    hint.textContent='Tocá una carta para verla en detalle';
    content.appendChild(hint);
  }

  function showRewardZoom(cid){
    tipOff();
    const c=CARDS.find(x=>x.id===cid);
    const isNew=!SAVE.coll.includes(cid);
    const ov=document.createElement('div');
    ov.id='reward-zoom-ov';
    ov.style.cssText='position:fixed;inset:0;z-index:500;background:rgba(0,0,0,.85);backdrop-filter:blur(6px);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.9rem;padding:1.5rem;';
    const cardWrap=document.createElement('div');
    cardWrap.style.cssText='width:min(200px,65vw);aspect-ratio:3/4;position:relative;flex-shrink:0;';
    cardWrap.innerHTML=cardFace(c);
    if(isNew){
      const badge=document.createElement('div');
      badge.style.cssText='background:linear-gradient(135deg,#52b788,#40916c);color:#fff;font-family:\'Cinzel\',serif;font-size:.65rem;font-weight:700;letter-spacing:.12em;padding:3px 14px;border-radius:20px;box-shadow:0 0 12px rgba(82,183,136,.7);white-space:nowrap;text-transform:uppercase;';
      badge.textContent='✦ Nueva';
      ov.appendChild(badge); // arriba de la carta, sin tapar números
    }
    const lore=document.createElement('div');
    lore.style.cssText='font-family:\'Philosopher\',serif;font-size:.75rem;color:var(--td);text-align:center;max-width:280px;font-style:italic;line-height:1.5;';
    lore.textContent='"'+c.lore+'"';
    const question=document.createElement('div');
    question.style.cssText='font-family:\'Cinzel\',serif;font-size:.8rem;color:var(--gold);text-align:center;';
    question.innerHTML='¿Te quedás con <strong>'+c.name+'</strong>?';
    const btns=document.createElement('div');
    btns.style.cssText='display:flex;gap:.6rem;justify-content:center;';
    const btnBack=document.createElement('button');
    btnBack.className='btn xs';
    btnBack.style.cssText='border-color:var(--td);color:var(--td);';
    btnBack.innerHTML='← Elegir otra';
    btnBack.onclick=()=>document.body.removeChild(ov);
    const btnConfirm=document.createElement('button');
    btnConfirm.className='btn xs green';
    btnConfirm.innerHTML='✓ Confirmar';
    btnConfirm.onclick=()=>{document.body.removeChild(ov);confirmReward(cid);};
    btns.appendChild(btnBack);
    btns.appendChild(btnConfirm);
    ov.appendChild(cardWrap);
    ov.appendChild(lore);
    ov.appendChild(question);
    ov.appendChild(btns);
    document.body.appendChild(ov);
  }
  renderCards();
}

function cancelReward(){
  const content=document.getElementById('rrewd');
  const cards=content.querySelectorAll('.rcard');
  cards.forEach(x=>{x.classList.remove('chosen');x.classList.remove('disabled');});
  // re-render by triggering the last renderRewardChoice call's internal state reset
  // simplest: just remove chosen class and clear confirm area
  const area=content.querySelector('div:last-child');
  if(area&&!area.classList.contains('rcard')){
    area.innerHTML='<div style="font-size:.65rem;color:var(--td);font-style:normal">Tocá una carta para seleccionarla</div>';
  }
  cards.forEach(c=>c.classList.remove('chosen'));
}

function confirmReward(cid){
  SAVE.coll.push(cid);save();
  const content=document.getElementById('rrewd');
  content.querySelectorAll('.rcard').forEach(x=>{x.classList.add('disabled');x.classList.remove('chosen');});
  const chosen=content.querySelectorAll('.rcard')[Array.from(content.querySelectorAll('.rcard')).findIndex(
    x=>{const name=x.querySelector('.cv-banner');return name&&CARDS.find(c=>c.id===cid)&&name.textContent===CARDS.find(c=>c.id===cid).name;}
  )];
  // highlight chosen card
  content.querySelectorAll('.rcard').forEach((x,i)=>{
    if(x.innerHTML&&cardFace(CARDS.find(c=>c.id===cid))&&x.innerHTML===x.innerHTML) {}
  });
  const area=content.querySelector('div:last-child');
  const c=CARDS.find(x=>x.id===cid);
  if(area&&!area.classList.contains('rcard')){
    area.innerHTML='<div style="font-family:\'Cinzel\',serif;font-size:.72rem;color:var(--pc);padding:.3rem 0">✓ <strong>'+c.name+'</strong> añadida a tu colección.</div>';
  }
  document.getElementById('rrewt').textContent='🏆 ¡Carta obtenida!';
}

// ── AI ─────────────────────────────────────────────────────────

// ── CHAT SYSTEM ─────────────────────────────────────────────────────────────
const CHAT_LINES = {
  0: { // Tomás
    greet:   ["¡Espero que hayas practicado! Yo llevo semanas jugando solo en el campo...","¿Primera vez? No te preocupes, te voy a enseñar cómo se pierde con estilo.","¡Bienvenido al duelo! Prometeme que no me vas a humillar demasiado."],
    winning: ["¿Ves? ¡Hasta un granjero puede ganar!","No soy tan malo como parezco, ¿eh?","¡Mi abuela me enseñó mejor que a vos!"],
    losing:  ["Ugh... esto no me estaba pasando ayer...","Suerte de principiante, seguro.","Está bien, está bien... no te confíes."],
    play:    ["¡Ahí va mi mejor carta!","Esto lo aprendí mirando al mercader del pueblo.","¡Toma eso!"],
    capture: ["¡Esa era mía!","¡No me hagas esto!","Qué jugada más sucia..."],
    end_win: ["¡No puedo creer que gané! ¡Voy a contarle a todo el pueblo!","¡Granjero: 1, aventurero: 0!"],
    end_lose:["Bien jugado... supongo. La próxima te va peor.","Empiezo a pensar que necesito más práctica..."],
  },
  1: { // Lira
    greet:   ["Los árboles me dijeron que vendrías. Y que perderías.","Sé gentil con las cartas... ellas sienten.","Juego despacio, pero seguro. No te confíes."],
    winning: ["El bosque fluye a través de mí.","Silencio y paciencia. Eso es todo.","Cada carta en su lugar perfecto."],
    losing:  ["Hmm... interesante movida.","Debí escuchar mejor al viento.","El bosque me avisa que debo concentrarme más."],
    play:    ["Las raíces son profundas.","Esta carta lleva siglos esperando.","Con calma y con certeza."],
    capture: ["Eso no estuvo bien.","¿Aprendiste eso solo?","Bien... pero no lo celebres aún."],
    end_win: ["El bosque siempre encuentra el camino.","Fue un honor jugar contigo, viajero."],
    end_lose:["La naturaleza acepta la derrota. Yo también.","Volveré más fuerte, como los árboles tras el invierno."],
  },
  2: { // Rowan
    greet:   ["Llevo veinte años en esta frontera. Nadie me ha cruzado dos veces.","Protocolo de duelo activado. Prepará tu mazo.","Sin rodeos: jugo para ganar."],
    winning: ["Como en el campo de batalla: control y disciplina.","Exactamente como lo planeé.","La frontera no se defiende con suerte."],
    losing:  ["Cambio de táctica. No me sorprende nada.","Bien. Aprendiste de mis errores.","Eso no volverá a pasar."],
    play:    ["Flanco izquierdo, asegurado.","Movimiento calculado.","Avance coordinado."],
    capture: ["¡Terreno perdido!","Buen ataque. Lo tendré en cuenta.","Retirada táctica."],
    end_win: ["La frontera resiste. Como siempre.","Victoria confirmada. A descansar."],
    end_lose:["Primera derrota en años. Me lo merezco.","Eras mejor de lo que esperaba, soldado."],
  },
  3: { // Vex
    greet:   ["Todo tiene un precio... incluyendo tu derrota.","No suelo jugar gratis. Haceme una oferta.","Vendo secretos. Hoy, te vendo una lección."],
    winning: ["Sabía que ibas a jugar eso. Te lo compré antes de que lo pusieras.","Información es poder, amigo.","¿Sorprendido? Yo no."],
    losing:  ["Mmm... no estaba en el contrato.","Interesante... muy interesante.","Revisaré mi inventario de estrategias."],
    play:    ["Una inversión segura.","Esta carta vale más de lo que parece.","Parte del plan, por supuesto."],
    capture: ["Eso va a mi colección privada.","Todo tiene un comprador.","Que quede en el registro."],
    end_win: ["Trato cerrado. Ha sido un placer.","El mejor negocio del día."],
    end_lose:["Pocas veces salgo perdiendo. Enhorabuena.","Te debo una revancha... y las deudas se pagan."],
  },
  4: { // Zarra
    greet:   ["¡Arrr! ¡Al abordaje!","En el mar yo mando. Aquí también.","¡Mi flota nunca fue hundida y hoy no va a ser diferente!"],
    winning: ["¡Iza las velas, que vamos ganando!","¡Como bombardear un puerto dormido!","¡Ja! ¡Sin piedad!"],
    losing:  ["¡Tormenta a la vista!","¡Todos a cubierta!","¡No me rindo tan fácil, maldición!"],
    play:    ["¡Fuego de cañón!","¡Que no quede nada en pie!","¡A todo vapor!"],
    capture: ["¡Me hundiste una nave!","¡Voy a recuperar ese terreno!","¡Maldito seas!"],
    end_win: ["¡Nadie hunde la flota de Zarra!","¡Victoria en alta mar!"],
    end_lose:["Primera vez que pierdo en aguas propias...","Bien peleado, pero no se lo digas a mi tripulación."],
  },
  5: { // Mira
    greet:   ["La tormenta está lista. ¿Y tú?","Mis cartas llevan la electricidad del cielo.","El clima obedece mi voluntad. Las cartas, también."],
    winning: ["Exactamente como lo calculé con las estrellas.","El relámpago no falla.","Siento el viento a mi favor."],
    losing:  ["Interesante perturbación atmosférica.","Recalibrando mis predicciones.","No esperaba esta tormenta."],
    play:    ["¡Descarga total!","El cielo habla.","Velocidad y precisión."],
    capture: ["¡Eso era mío, mortal!","Que el rayo te guíe... lejos de mi tablero.","Bien calculado."],
    end_win: ["La tormenta siempre gana al final.","El arcanista nunca pierde su tormenta."],
    end_lose:["Una anomalía meteorológica... no volverá a ocurrir.","Te concedo esta batalla. Solo esta."],
  },
  6: { // Grevik
    greet:   ["El norte es frío e implacable. Como yo.","Pocas visitas llegan al castillo. Pocas salen.","Bien. Que empiece la sesión."],
    winning: ["El norte domina.","La estrategia del frío: esperar y aplastar.","Como siempre ha sido."],
    losing:  ["No esperaba que llegaras tan lejos.","Ajusto mis defensas.","El invierno es largo. Y yo también."],
    play:    ["Muro de piedra.","Desde el trono del norte.","Inamovible."],
    capture: ["¡Eso es territorio del norte!","Audaz. Pero cometiste un error.","Te lo devolveré con intereses."],
    end_win: ["El norte no cae.","Como siempre ha sido y siempre será."],
    end_lose:["Nunca pensé que diría esto... bien jugado.","El norte recuerda sus derrotas. Y aprende."],
  },
  7: { // Valdra
    greet:   ["Las sombras me susurraron tu nombre antes que llegaras.","No temas a la oscuridad... teme a lo que vive en ella.","¿Sabías que ya robé tu primer mazo a un dios? El tuyo no me impresionará."],
    winning: ["Las sombras se alimentan de tu desesperación.","Todo según lo que las tinieblas ordenaron.","La oscuridad siempre consume."],
    losing:  ["Interesante... las sombras raramente mienten.","Quizás me equivoqué al subestimarlos.","Algo en la oscuridad cambió."],
    play:    ["Desde el vacío, emerge.","Las sombras obedecen.","Que la oscuridad caiga."],
    capture: ["¡Eso pertenece a la noche!","Las sombras no perdonan.","Otro alma para mi colección."],
    end_win: ["La oscuridad devora todo... incluyéndote.","El vacío es paciente. Siempre gana."],
    end_lose:["Esto no termina aquí, mortal.","Las sombras recordarán este momento."],
  },
  8: { // Eron
    greet:   ["Descifré el Darkspell. Tus cartas no tienen secretos para mí.","Las runas no mienten. Las tuyas dicen que perderás.","Estudiá bien cada movimiento. Yo ya estudié los tuyos."],
    winning: ["Las runas no fallan.","Calculado con precisión académica.","Exactamente en el orden esperado."],
    losing:  ["Una variable que no contemplé.","Recalculando...","Raramente me sorprenden. Bien hecho."],
    play:    ["Runa activada.","El conocimiento en acción.","Precisión arcana."],
    capture: ["Eso altera mis cálculos.","Documentado.","Interesante anomalía."],
    end_win: ["El Darkspell ha sido descifrado, y tú con él.","Conocimiento sobre todo."],
    end_lose:["Primera derrota en años. Merece un capítulo propio en mis notas.","Admirable. Superaste mi análisis."],
  },
  9: { // Drak
    greet:   ["Doscientos años sin perder. Hoy no cambia nada.","Malachar me envía. Eso debería bastar para que te rindas.","No siento piedad. Nunca la sentí."],
    winning: ["El vacío consume todo a su paso.","Exactamente como predije hace dos siglos.","No hay escapatoria del Señor Oscuro."],
    losing:  ["...Inesperado.","El señor oscuro no estará satisfecho.","Malachar no aprobaría este resultado."],
    play:    ["Por la voluntad del Señor Oscuro.","Vacío eterno.","Sin misericordia."],
    capture: ["¡Traición al Señor Oscuro!","Eso tendrá consecuencias.","No lo volverás a hacer."],
    end_win: ["Dos siglos de victorias. La tuya no fue más que una estadística.","Regresa a Malachar con mis saludos... si sobrevives."],
    end_lose:["...Esto no puede ser. Malachar lo sabrá.","Doscientos años... hasta hoy."],
  },
  10: { // Sylara
    greet:   ["El bosque eterno me guía. ¿Quién te guía a ti?","Soy la última de mi estirpe. No caeré fácilmente.","Los dioses del bosque bendijeron cada carta de mi mazo."],
    winning: ["La naturaleza en su forma más pura.","Los dioses del bosque eterno me guían.","La última reina no cae."],
    losing:  ["Hmm... los dioses trabajan de formas misteriosas.","Inesperado, pero no imposible.","El bosque eterno aún está conmigo."],
    play:    ["Bendición del bosque eterno.","Por la estirpe élfica.","La naturaleza en su plenitud."],
    capture: ["¡Eso es sagrado!","El bosque llorará por esa carta.","No te lo perdonaré."],
    end_win: ["La última reina permanece invicta. Como debe ser.","El bosque eterno celebra esta victoria."],
    end_lose:["Quizás los dioses te eligieron a ti hoy. Cuida bien ese honor.","Primera derrota en siglos. Mereces mi respeto."],
  },
  11: { // Malachar
    greet:   ["Mil años esperando un rival digno. No creo que seas tú.","El Darkspell me pertenece. Igual que esta partida.","Podrías rendirte ahora. Te ahorraría tiempo."],
    winning: ["Mil años de oscuridad no se vencen en minutos.","El Destructor Eterno no conoce la derrota.","Todo el reino caerá. Empezando por ti."],
    losing:  ["...Interesante.","Mil años... y aún encuentro sorpresas.","No te alegres demasiado pronto."],
    play:    ["El poder absoluto.","Desde las tinieblas eternas.","Nada puede contener esto."],
    capture: ["¡INSOLENTE!","Esa es la última vez que me quitas algo.","Pagarás ese atrevimiento."],
    end_win: ["Nadie ha roto el Darkspell en mil años. Tú tampoco.","El reino es mío. Siempre lo fue."],
    end_lose:["...Imposible. Y sin embargo.","En mil años... nadie lo había logrado. Recuerda este día."],
  },
};

let _chatOpen = false;
let _chatUnread = 0;
let _chatTriggered = {};  // track triggered events per game

function chatToggle(){
  _chatOpen = !_chatOpen;
  document.getElementById('chat-box').classList.toggle('open', _chatOpen);
  if(_chatOpen){
    _chatUnread = 0;
    const el = document.getElementById('chat-unread');
    el.style.display = 'none';
    const log = document.getElementById('chat-log');
    log.scrollTop = log.scrollHeight;
  }
}

function chatMsg(side, text, avatarSrc, name){
  const log = document.getElementById('chat-log');
  if(!log) return;
  const msg = document.createElement('div');
  msg.className = 'chat-msg ' + side;
  const av = document.createElement('img');
  av.className = 'chat-av' + (side==='player'?' you':'');
  av.src = avatarSrc || '';
  av.alt = '';
  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble';
  const nm = document.createElement('div');
  nm.className = 'chat-name';
  nm.textContent = name || '';
  bubble.appendChild(nm);
  bubble.appendChild(document.createTextNode(text));
  msg.appendChild(av);
  msg.appendChild(bubble);
  log.appendChild(msg);
  log.scrollTop = log.scrollHeight;

  if(!_chatOpen){
    _chatUnread++;
    const el = document.getElementById('chat-unread');
    el.textContent = _chatUnread;
    el.style.display = 'flex';
  }
}

function chatEnemyMsg(ctx){
  const d = DUELISTS.find(x=>x.id===G.did);
  if(!d) return;
  const lines = CHAT_LINES[d.id];
  if(!lines || !lines[ctx] || lines[ctx].length===0) return;
  // avoid repeating same context too often
  if(!_chatTriggered[ctx]) _chatTriggered[ctx] = 0;
  _chatTriggered[ctx]++;
  const arr = lines[ctx];
  const text = arr[Math.floor(Math.random()*arr.length)];
  const port = d.port;
  // Build avatar src from portrait in DUELISTS
  let avSrc = '';
  const portEl = document.querySelector('#duel-popup .dp img');
  if(portEl) avSrc = portEl.src;
  setTimeout(()=>{ chatMsg('enemy', text, avSrc, d.name); }, 400);
}

function chatSend(){
  const inp = document.getElementById('chat-input');
  const text = inp.value.trim();
  if(!text) return;
  // Player message
  chatMsg('player', text, '', 'Vos');
  inp.value = '';
  // Online: el mensaje viaja de verdad al rival real, sin respuesta simulada
  if(G && G.online){
    mpSend({t:'chat', text});
    return;
  }
  // Enemy response after delay (random from 'play' pool as generic reaction)
  const d = DUELISTS.find(x=>x.id===G?.did);
  if(d){
    const pool = [...(CHAT_LINES[d.id]?.play||[]), ...(CHAT_LINES[d.id]?.capture||[])];
    if(pool.length){
      const resp = pool[Math.floor(Math.random()*pool.length)];
      setTimeout(()=>{
        let avSrc='';
        const portEl=document.querySelector('#duel-popup .dp img');
        if(portEl) avSrc=portEl.src;
        chatMsg('enemy', resp, avSrc, d.name);
      }, 900 + Math.random()*800);
    }
  }
}

function chatReset(){
  const log = document.getElementById('chat-log');
  if(log) log.innerHTML = '';
  _chatOpen = false;
  _chatUnread = 0;
  _chatTriggered = {};
  const box = document.getElementById('chat-box');
  if(box) box.classList.remove('open');
  const unr = document.getElementById('chat-unread');
  if(unr){ unr.style.display='none'; unr.textContent='0'; }
}
// ── END CHAT ─────────────────────────────────────────────────────────────────

async function aiTurn(){
  await dl(350);
  const empty=G.board.map((v,i)=>v?null:i).filter(i=>i!==null);
  if(!empty.length||!G.eh.length){G.turn='player';render();return;}
  const d=DUELISTS.find(x=>x.id===G.did);
  let best=null,bs=-999;
  G.eh.forEach((cid,ci)=>{
    empty.forEach(ei=>{
      let sc=simCap(ei,cid,1);
      if(d&&d.diff>=4)sc+=[0,2,4,6,8].includes(ei)?.5:0;
      if(sc>bs){bs=sc;best={cid,ci,ei};}
    });
  });
  if(!best)best={cid:G.eh[0],ci:0,ei:empty[0]};
  G.eh.splice(best.ci,1);
  placeCapture(best.ei,best.cid,1);
  const c=CARDS.find(x=>x.id===best.cid);
  addLog('Enemigo juega '+c.name+' en posición '+(best.ei+1),'le');
  // Chat: enemy plays
  const _ps=G.board.filter(x=>x&&x.owner===0).length,_es=G.board.filter(x=>x&&x.owner===1).length;
  if(_es>_ps+1) chatEnemyMsg('winning');
  else if(_ps>_es+1) chatEnemyMsg('losing');
  else if(Math.random()<0.35) chatEnemyMsg('play');
  const eb=G.board[best.ei].elBonus;
  if(eb===1) addLog('✦ El enemigo recibe bono elemental de '+ELEM_NAME[G.board[best.ei].cellElAtPlacement]+'!','lel');
  else if(eb===-1) addLog('✦ El enemigo sufre penalización elemental ('+ELEM_NAME[G.board[best.ei].cellElAtPlacement]+').','lel');
  const cellEl=document.querySelector('.cell[data-i="'+best.ei+'"]');
  if(cellEl){const bcE=cellEl.querySelector('.bc');if(bcE)bcE.classList.add('place');}
  recalc();render();
  if(gameOver())return;
  G.turn='player';render();
}
function simCap(ci,cid,owner){
  const c=CARDS.find(x=>x.id===cid),opp=owner===0?1:0;
  const eff=effectiveStats(c,ci);
  let sc=0;
  [[0,2,ci-3,ci>=3],[1,3,ci+1,ci%3!==2],[2,0,ci+3,ci<6],[3,1,ci-1,ci%3!==0]]
    .forEach(([d,od,ni,v])=>{
      if(!v)return;const nb=G.board[ni];if(!nb)return;
      if(nb.o===opp&&eff.stats[d]>nb.stats[od])sc+=2;
      if(nb.o===owner&&nb.stats[od]>eff.stats[d])sc-=1;
    });
  if(eff.elBonus===1)sc+=1; else if(eff.elBonus===-1)sc-=1;
  return sc;
}
const dl=ms=>new Promise(r=>setTimeout(r,ms));

// ── PARTICLES ─────────────────────────────────────────────────
const cnv=document.getElementById('fx'),ctx=cnv.getContext('2d');
let parts=[],animR=false;
function rsz(){cnv.width=window.innerWidth;cnv.height=window.innerHeight;}
rsz();window.addEventListener('resize',rsz);

function spawnFX(x,y,col,cnt){
  const hx=col.replace('#','');
  const r=parseInt(hx.slice(0,2),16),g=parseInt(hx.slice(2,4),16),b=parseInt(hx.slice(4,6),16);
  const limit=Math.min(cnt,5); // cap at 5 particles per spawn
  for(let i=0;i<limit;i++){
    const a=Math.random()*Math.PI*2,sp=1.5+Math.random()*2.5;
    parts.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-0.8,r,g,b,alpha:1,size:2+Math.random()*3,decay:.04+Math.random()*.03});
  }
  if(!animR)animLoop();
}
function celebFX(){
  const cx=window.innerWidth/2,cy=window.innerHeight/2;
  ['#FFD166','#52b788','#4895ef','#9d4edd','#e85d04'].forEach(col=>{
    const hx=col.replace('#',''),r=parseInt(hx.slice(0,2),16),g=parseInt(hx.slice(2,4),16),b=parseInt(hx.slice(4,6),16);
    for(let i=0;i<8;i++){const a=(i/8)*Math.PI*2+Math.random()*.3,sp=2.5+Math.random()*3.5;parts.push({x:cx,y:cy,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-1.5,r,g,b,alpha:1,size:2.5+Math.random()*3.5,decay:.022});}
  });
  if(!animR)animLoop();
}
function animLoop(){
  animR=true;ctx.clearRect(0,0,cnv.width,cnv.height);
  parts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.08;p.alpha-=p.decay;if(p.alpha<=0)return;ctx.save();ctx.globalAlpha=p.alpha;ctx.fillStyle='rgb('+p.r+','+p.g+','+p.b+')';ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();ctx.restore();});
  parts=parts.filter(p=>p.alpha>0);
  if(parts.length>0)requestAnimationFrame(animLoop);else animR=false;
}

// ── LOG ───────────────────────────────────────────────────────
function clearLog(){document.getElementById('log').innerHTML='';}
function addLog(msg,cls){const l=document.getElementById('log');const d=document.createElement('div');d.className='log-line '+(cls||'');d.textContent=msg;l.appendChild(d);l.scrollTop=l.scrollHeight;}

// ── TOOLTIP ───────────────────────────────────────────────────
const ttEl=document.getElementById('tt');
function tip(e,c){document.getElementById('ttn').textContent=c.name;document.getElementById('ttf').innerHTML='<span style="color:'+FC[c.f]+'">'+elemIcon(c.f,34)+' '+ELEM_NAME[c.f].toUpperCase()+' · '+c.st+'★</span>';const s=c.stats;document.getElementById('tts').innerHTML='<span>↑'+fmtN(s[0])+'</span><span>→'+fmtN(s[1])+'</span><span>↓'+fmtN(s[2])+'</span><span>←'+fmtN(s[3])+'</span>';document.getElementById('ttl').textContent=c.lore;ttEl.classList.add('show');tipMv(e);}
function tipOff(){ttEl.classList.remove('show');}
function tipMv(e){
  if(window.matchMedia('(pointer:coarse)').matches){ttEl.classList.remove('show');return;}
  let x=e.clientX+14,y=e.clientY-20;
  if(x+160>window.innerWidth)x=e.clientX-165;
  if(y+150>window.innerHeight)y=e.clientY-155;
  ttEl.style.left=x+'px';ttEl.style.top=y+'px';
}
document.addEventListener('touchstart',()=>ttEl.classList.remove('show'),{passive:true});

// ═══════════════════════════════════════════════════════════
// MULTIJUGADOR ONLINE (Beta) — P2P directo entre celulares vía PeerJS
// No usa servidor propio: PeerJS provee solo el "apretón de manos"
// inicial (gratis, público); la partida viaja directo entre los
// dos dispositivos. No modifica ni una línea del modo campaña.
// ═══════════════════════════════════════════════════════════
let MP={peer:null,conn:null,isHost:false,roomCode:null,myDeck:null,oppDeck:null,oppAvatar:'tomas',oppTok:null,cellEl:null,iAmFirst:null,ready:false,deckSent:false,oppReady:false};
let mpSel=[];

function mpRoomCode(){
  const ch='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s=''; for(let i=0;i<5;i++) s+=ch[Math.floor(Math.random()*ch.length)];
  return s;
}

// ── PANTALLA DE REGLAS (visual, sin jugar el tutorial) ──────────
function showRules(){
  const ov=document.createElement('div');
  ov.id='rules-ov';
  ov.style.cssText='position:fixed;inset:0;z-index:490;background:rgba(0,0,5,.96);display:flex;flex-direction:column;align-items:center;padding:1rem;overflow:hidden;';

  const demo1=CARDS.find(c=>c.id==='chispa');   // ★1 storm, valores parejos
  const demo2=CARDS.find(c=>c.id==='lanzero');  // ★1 fire

  const miniCard=(c,extra)=>'<div class="hc" style="width:66px;position:relative;'+ (extra||'') +'">'+cardFace(c)+'</div>';

  ov.innerHTML='<div style="width:100%;max-width:440px;height:100%;display:flex;flex-direction:column;overflow-y:auto;">'
    +'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.6rem">'
    +'<div style="width:60px"></div>'
    +'<div style="font-family:\'Cinzel Decorative\',serif;font-size:.95rem;color:#7fd8ff;text-align:center;flex:1">📜 Reglas del Juego</div>'
    +'<button class="btn xs" style="border-color:var(--td);color:var(--td)" onclick="document.getElementById(\'rules-ov\').remove()">✕</button>'
    +'</div>'

    +'<div class="rules-box" style="margin-bottom:.7rem">'
    +'<strong>🎯 Objetivo</strong><br>El tablero tiene 9 casillas (3×3). Ganás si al llenarse tenés más cartas que tu rival — sumando las que están en el tablero más las que te quedaron en la mano.'
    +'</div>'

    +'<div class="rules-box" style="margin-bottom:.7rem">'
    +'<strong>🃏 Las 4 cartas de cada mano</strong><br>Cada jugador arma un equipo de 5 cartas antes del duelo. Por turnos, cada uno coloca UNA carta en una casilla vacía.'
    +'</div>'

    +'<div class="rules-box" style="margin-bottom:.7rem">'
    +'<strong>⚔ Cómo capturar</strong><br>Cada carta tiene 4 valores: arriba, derecha, abajo, izquierda. Al colocar una carta, se compara cada valor contra el valor OPUESTO de la carta rival adyacente. Si el tuyo es mayor, la capturás y pasa a ser tuya.'
    +'<div style="display:flex;align-items:center;justify-content:center;gap:.5rem;margin-top:.6rem">'
    +miniCard(demo1)
    +'<div style="font-family:Cinzel,serif;color:var(--gold);font-size:1.1rem">→</div>'
    +miniCard(demo2,'outline:2px solid #e85d04;')
    +'</div>'
    +'<div style="text-align:center;font-size:.62rem;color:var(--td);margin-top:.35rem">Si el valor derecho de tu carta supera el valor izquierdo de la carta rival, la capturás.</div>'
    +'</div>'

    +'<div class="rules-box" style="margin-bottom:.7rem">'
    +'<strong>🌋 Casillas con elemento</strong><br>Algunas casillas del tablero tienen un elemento (🔥⚡🌿🌑). Si el elemento de tu carta coincide, sus 4 valores suben +1 mientras esté ahí. Si no coincide, bajan −1.'
    +'</div>'

    +'<div class="rules-box" style="margin-bottom:.7rem">'
    +'<strong>⭐ Rareza</strong><br>Las cartas van de ★1 (más débiles) a ★5 legendarias (las más fuertes). A mayor rareza, valores más altos en general — pero incluso una ★1 bien colocada puede capturar a una ★5.'
    +'</div>'

    +'<div class="rules-box" style="margin-bottom:.7rem">'
    +'<strong>🏆 Victoria Perfecta</strong><br>Si al terminar el duelo convertiste TODAS las cartas que jugó tu rival, te quedás con todas como botín — no hay que elegir solo una.'
    +'</div>'

    +'<div class="rules-box" style="margin-bottom:1rem">'
    +'<strong>⚡ Energía</strong><br>Cada duelo cuesta energía. Se recupera solo con el tiempo, ganando duelos, o comprándola en la tienda con ✨ PM.'
    +'</div>'

    +'<button class="btn sm" style="border-color:#7fd8ff;color:#7fd8ff;margin-bottom:1rem" onclick="document.getElementById(\'rules-ov\').remove()">Entendido</button>'
    +'</div>';
  document.body.appendChild(ov);
}


// ── RENDICIÓN: termina el duelo antes de tiempo como derrota ─────────
// Funciona igual en campaña, Partida Rápida y online (reusa showResult()
// directamente, sin pasar por gameOver() que exige el tablero lleno).
function confirmSurrender(){
  if(!G || G.over) return;
  const ov=document.createElement('div');
  ov.className='sell-confirm';
  ov.innerHTML='<div class="sell-box"><h3>🏳 ¿Rendirte?</h3>'
    +'<p>'+(G.online?'Tu rival ganará el duelo y vos sumarás una derrota.':'El duelo termina como derrota. No se otorgan recompensas.')+'</p>'
    +'<div class="sell-actions">'
    +'<button class="btn xs" onclick="doSurrender();this.closest(\'.sell-confirm\').remove()">Sí, rendirme</button>'
    +'<button class="btn xs" style="border-color:rgba(255,255,255,.2);color:var(--td)" onclick="this.closest(\'.sell-confirm\').remove()">Seguir jugando</button>'
    +'</div></div>';
  document.body.appendChild(ov);
}
function doSurrender(){
  if(!G || G.over) return;
  if(G.online) mpSend({t:'surrender'});
  const p=G.ps||0, e=G.es||0;
  G.over=true; G.perfectWin=false; G.energyGain=0; G.pendingCine=null;
  if(G.online){
    SAVE.stats=SAVE.stats||{duelsWon:0,qmWins:0,mpGames:0};
    SAVE.stats.mpGames=(SAVE.stats.mpGames||0)+1;
    save();
  }
  render();
  setTimeout(()=>showResult(false,false,p,e,[],false),400);
}

function mpOpenLobby(){
  if(typeof Peer==='undefined'){
    showToastMsg('⚠ No se pudo cargar el módulo online. Revisá tu conexión a internet e intentá de nuevo.');
    return;
  }
  const ov=document.createElement('div');
  ov.id='mp-lobby-ov';
  ov.style.cssText='position:fixed;inset:0;z-index:480;background:rgba(0,0,5,.92);backdrop-filter:blur(6px);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:1.4rem;gap:1rem;';
  ov.innerHTML='<div style="font-family:\'Cinzel Decorative\',serif;font-size:1.05rem;color:#7fd8ff;text-shadow:0 0 14px rgba(127,216,255,.5)">🌐 Duelo en Línea</div>'
    +'<div id="mp-lobby-body" style="width:100%;max-width:320px;display:flex;flex-direction:column;gap:.7rem;"></div>'
    +'<button class="btn xs" style="border-color:var(--td);color:var(--td)" onclick="mpCloseLobby()">✕ Cerrar</button>';
  document.body.appendChild(ov);
  mpRenderLobbyHome();
}
function mpCloseLobby(){
  const ov=document.getElementById('mp-lobby-ov'); if(ov)ov.remove();
  if(!MP.ready) mpTeardown();
}
function mpTeardown(){
  if(MP.conn){ try{MP.conn.close();}catch(e){} }
  if(MP.peer){ try{MP.peer.destroy();}catch(e){} }
  MP={peer:null,conn:null,isHost:false,roomCode:null,myDeck:null,oppDeck:null,oppAvatar:'tomas',oppTok:null,cellEl:null,iAmFirst:null,ready:false,deckSent:false,oppReady:false};
}
function mpRenderLobbyHome(){
  const b=document.getElementById('mp-lobby-body'); if(!b)return;
  b.innerHTML='<div style="font-family:Philosopher,serif;font-size:.72rem;color:var(--td);text-align:center;line-height:1.6">'
    +'Jugá contra otra persona en tiempo real usando las cartas de tu propia colección.<br>'
    +'<span style="color:#e0aaff">Función Beta — ambos necesitan internet.</span></div>'
    +'<button class="btn sm" style="border-color:#7fd8ff;color:#7fd8ff" onclick="mpHost()">🏠 Crear sala</button>'
    +'<div style="text-align:center;font-family:Cinzel,serif;font-size:.65rem;color:var(--td)">— o —</div>'
    +'<input id="mp-code-input" maxlength="5" placeholder="CÓDIGO DE SALA" style="text-align:center;text-transform:uppercase;letter-spacing:.3em;font-family:\'Cinzel\',serif;font-size:.95rem;padding:.6rem;border-radius:8px;border:1.5px solid rgba(127,216,255,.4);background:rgba(0,0,20,.5);color:#7fd8ff;">'
    +'<button class="btn sm" style="border-color:#f4a261;color:#f4a261" onclick="mpJoin()">🔑 Unirse con código</button>';
}
function mpSetBody(html){ const b=document.getElementById('mp-lobby-body'); if(b) b.innerHTML=html; }

function mpHost(){
  MP.isHost=true;
  MP.roomCode=mpRoomCode();
  mpSetBody('<div style="text-align:center;font-family:Philosopher,serif;font-size:.78rem;color:var(--td)">Creando sala…</div>');
  try{ MP.peer=new Peer('ds-'+MP.roomCode,{debug:0}); }
  catch(e){ mpConnFail('No se pudo crear la sala.'); return; }
  MP.peer.on('open',()=>{
    mpSetBody('<div style="text-align:center">'
      +'<div style="font-family:Philosopher,serif;font-size:.68rem;color:var(--td);margin-bottom:.4rem">Compartí este código con tu rival:</div>'
      +'<div style="font-family:\'Cinzel Decorative\',serif;font-size:1.6rem;letter-spacing:.25em;color:#7fd8ff;text-shadow:0 0 16px rgba(127,216,255,.6);margin-bottom:.6rem">'+MP.roomCode+'</div>'
      +'<div style="font-size:1.4rem;margin:.4rem 0">⏳</div>'
      +'<div style="font-family:Philosopher,serif;font-size:.7rem;color:var(--td)">Esperando a que se conecte…</div></div>');
  });
  MP.peer.on('connection',c=>{
    if(MP.conn){ c.close(); return; }
    MP.conn=c; mpWireConn();
  });
  MP.peer.on('error',e=>{ mpConnFail('Error de conexión: '+(e&&e.type?e.type:'desconocido')); });
}
function mpJoin(){
  const inp=document.getElementById('mp-code-input');
  const code=(inp?inp.value:'').trim().toUpperCase();
  if(code.length<4){ showToastMsg('Ingresá un código válido.'); return; }
  MP.isHost=false;
  mpSetBody('<div style="text-align:center;font-family:Philosopher,serif;font-size:.78rem;color:var(--td)">Conectando…</div>');
  try{ MP.peer=new Peer(undefined,{debug:0}); }
  catch(e){ mpConnFail('No se pudo iniciar la conexión.'); return; }
  MP.peer.on('open',()=>{
    MP.conn=MP.peer.connect('ds-'+code,{reliable:true});
    MP.conn.on('open',()=>{ mpWireConn(); });
    MP.conn.on('error',()=>{ mpConnFail('No se encontró esa sala. Revisá el código.'); });
  });
  MP.peer.on('error',e=>{ mpConnFail('No se encontró esa sala. Revisá el código.'); });
}
function mpConnFail(msg){
  mpSetBody('<div style="text-align:center;font-family:Philosopher,serif;font-size:.75rem;color:#ff8a8a;line-height:1.6">⚠ '+msg+'</div>'
    +'<button class="btn xs" style="margin-top:.6rem;border-color:var(--td);color:var(--td)" onclick="mpTeardown();mpRenderLobbyHome()">← Intentar de nuevo</button>');
}
function mpWireConn(){
  MP.conn.on('data',d=>mpOnData(d));
  MP.conn.on('close',()=>{ if(!G.over) mpOnDisconnect(); });
  mpSetBody('<div style="text-align:center;font-family:Philosopher,serif;font-size:.75rem;color:#52b788">✓ ¡Conectado!</div>');
  setTimeout(()=>mpShowConnectedMenu(),400);
}
function mpShowConnectedMenu(){
  ['mp-lobby-ov','mp-deck-ov','mp-trade-ov'].forEach(id=>{const el=document.getElementById(id); if(el)el.remove();});
  const ov=document.createElement('div');
  ov.id='mp-menu-ov';
  ov.style.cssText='position:fixed;inset:0;z-index:480;background:rgba(0,0,5,.94);backdrop-filter:blur(6px);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:1.4rem;gap:1rem;';
  ov.innerHTML='<div style="font-family:\'Cinzel Decorative\',serif;font-size:1rem;color:#52b788;text-shadow:0 0 12px rgba(82,183,136,.5)">✓ Conectado con tu rival</div>'
    +'<div style="width:100%;max-width:320px;display:flex;flex-direction:column;gap:.7rem;">'
    +'<button class="btn sm" style="border-color:#7fd8ff;color:#7fd8ff" onclick="mpOpenDeckPicker()">⚔ Jugar un duelo</button>'
    +'<button class="btn sm" style="border-color:#e0aaff;color:#e0aaff" onclick="mpOpenTrade()">🔄 Intercambiar cartas</button>'
    +'<button class="btn xs" style="border-color:var(--td);color:var(--td);margin-top:.3rem" onclick="mpLeaveDeckPicker()">✕ Salir de la sala</button>'
    +'</div>';
  document.body.appendChild(ov);
}
function mpSend(msg){ if(MP.conn&&MP.conn.open) MP.conn.send(msg); }

function mpOpenDeckPicker(){
  mpSel=(Array.isArray(SAVE.lastDeck)?[...new Set(SAVE.lastDeck)].filter(cid=>SAVE.coll.includes(cid)):[]).slice(0,5);
  const lov=document.getElementById('mp-lobby-ov'); if(lov)lov.remove();
  const p=document.createElement('div');
  p.id='mp-deck-ov';
  p.style.cssText='position:fixed;inset:0;z-index:480;background:rgba(0,0,5,.95);display:flex;flex-direction:column;align-items:center;padding:1rem;overflow:hidden;';
  p.innerHTML='<div style="width:100%;max-width:420px;height:100%;display:flex;flex-direction:column;">'
    +'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.5rem">'
    +'<button class="btn xs" style="border-color:var(--td);color:var(--td)" onclick="mpShowConnectedMenu()">← Volver</button>'
    +'<div style="font-family:\'Cinzel Decorative\',serif;font-size:.85rem;color:#7fd8ff;text-align:center;flex:1">🌐 Elegí tus 5 cartas</div>'
    +'<div style="width:64px"></div>'
    +'</div>'
    +'<div id="mp-deck-slots" style="display:flex;gap:.4rem;justify-content:center;margin-bottom:.6rem"></div>'
    +'<div id="mp-deck-grid" style="flex:1;overflow-y:auto;display:grid;grid-template-columns:repeat(3,1fr);gap:.5rem;padding:.3rem;"></div>'
    +'<button class="btn sm" id="mp-deck-go" style="margin-top:.6rem;border-color:#52b788;color:#52b788" disabled></button>'
    +'</div>';
  document.body.appendChild(p);
  mpRenderDeckPicker();
}
function mpToggleSel(cid){
  const i=mpSel.indexOf(cid);
  if(i>=0) mpSel.splice(i,1); else if(mpSel.length<5) mpSel.push(cid);
  mpRenderDeckPicker();
}
function mpRenderDeckPicker(){
  const slots=document.getElementById('mp-deck-slots'); if(!slots)return;
  slots.innerHTML=Array.from({length:5},(_,i)=>{
    const cid=mpSel[i];
    if(!cid) return '<div style="width:44px;height:59px;border:1.5px dashed rgba(127,216,255,.3);border-radius:6px;"></div>';
    const c=CARDS.find(x=>x.id===cid);
    return '<div class="hc" style="width:44px;border-color:#7fd8ff;">'+cardFace(c)+'</div>';
  }).join('');
  const pow=cid=>{const c=CARDS.find(x=>x.id===cid);return c?c.st*100+c.stats.reduce((a,b)=>a+b,0):0;};
  const grid=document.getElementById('mp-deck-grid');
  grid.innerHTML='';
  [...new Set(SAVE.coll)].sort((a,b)=>pow(a)-pow(b)).forEach(cid=>{
    const c=CARDS.find(x=>x.id===cid); if(!c)return;
    const sel=mpSel.includes(cid);
    const div=document.createElement('div');
    div.className='hc';
    div.style.cssText='width:100%;cursor:pointer;border:2px solid '+(sel?'#52b788':'rgba(255,255,255,.15)')+';'+(sel?'':'opacity:.75');
    div.innerHTML=cardFace(c);
    div.onclick=()=>mpToggleSel(cid);
    grid.appendChild(div);
  });
  const go=document.getElementById('mp-deck-go'); if(!go)return;
  if(MP.deckSent){
    go.disabled=true; go.textContent=MP.oppReady?'Iniciando…':'Esperando al rival…';
  }else if(mpSel.length===5){
    go.disabled=false; go.textContent='⚔ ¡Confirmar equipo!'; go.onclick=mpConfirmDeck;
  }else{
    go.disabled=true; go.textContent='Elegí 5 cartas ('+mpSel.length+'/5)';
  }
}
function mpConfirmDeck(){
  if(mpSel.length!==5)return;
  MP.myDeck=[...mpSel];
  MP.deckSent=true;
  mpRenderDeckPicker();
  mpSend({t:'hello',deck:MP.myDeck,avatar:SAVE.avatar});
  mpMaybeStart();
}
function mpMaybeStart(){
  if(!MP.myDeck||!MP.oppDeck)return;
  if(MP.isHost){
    const cellEl=Array(9).fill(null);
    const idxs=shuffleArr([0,1,2,3,4,5,6,7,8]);
    const numElem=2+Math.floor(Math.random()*3);
    for(let i=0;i<numElem;i++) cellEl[idxs[i]]=ELEMENTS_LIST[Math.floor(Math.random()*ELEMENTS_LIST.length)];
    const hostFirst=Math.random()<0.5;
    MP.cellEl=cellEl; MP.iAmFirst=hostFirst;
    mpSend({t:'start',cellEl,hostFirst});
    mpBeginDuel();
  }
}
function mpOnData(msg){
  if(!msg||!msg.t)return;
  if(msg.t==='hello'){
    MP.oppDeck=msg.deck; MP.oppAvatar=msg.avatar||'tomas';
    MP.oppTok=(AVATAR_IMG&&AVATAR_IMG[MP.oppAvatar])||AVATAR_IMG.tomas;
    MP.oppReady=true;
    mpRenderDeckPicker();
    mpMaybeStart();
  }else if(msg.t==='start'){
    MP.cellEl=msg.cellEl; MP.iAmFirst=!msg.hostFirst;
    mpBeginDuel();
  }else if(msg.t==='move'){
    mpReceiveMove(msg.ci,msg.cid);
  }else if(msg.t==='bye'){
    mpOnDisconnect(true);
  }else if(msg.t==='chat'){
    chatMsg('enemy', msg.text, MP.oppTok||'', 'Rival');
  }else if(msg.t==='trade_hello'){
    const yaActivo=MPTRADE.active;
    MPTRADE.theirColl=msg.coll;
    if(!yaActivo){
      MPTRADE.active=true;
      mpSend({t:'trade_hello',coll:SAVE.coll});
      mpOpenTrade();
    }else{
      mpRenderTrade();
    }
  }else if(msg.t==='trade_offer'){
    MPTRADE.incoming={give:msg.give,want:msg.want};
    mpRenderTrade();
  }else if(msg.t==='trade_accept'){
    if(MPTRADE.pending==='sent'){
      const idx=SAVE.coll.indexOf(MPTRADE.myOffer);
      if(idx>-1) SAVE.coll.splice(idx,1);
      SAVE.coll.push(MPTRADE.theirWant);
      save();checkAvatarUnlocks();
      const got=CARDS.find(c=>c.id===MPTRADE.theirWant);
      showToastMsg('🔄 ¡Tu rival aceptó! Recibiste '+(got?got.name:'una carta')+'.');
      MPTRADE.myOffer=null;MPTRADE.theirWant=null;MPTRADE.pending=null;
      mpRenderTrade();
    }
  }else if(msg.t==='trade_reject'){
    if(MPTRADE.pending==='sent'){
      showToastMsg('Tu rival rechazó la propuesta de intercambio.');
      MPTRADE.pending=null;
      mpRenderTrade();
    }
  }else if(msg.t==='surrender'){
    if(G && G.online && !G.over){
      const p=G.ps||0, e=G.es||0;
      G.over=true; G.perfectWin=false; G.pendingCine=null;
      SAVE.stats=SAVE.stats||{duelsWon:0,qmWins:0,mpGames:0};
      SAVE.stats.mpGames=(SAVE.stats.mpGames||0)+1;
      G.energyGain=ENERGY.win; gainEnergy(ENERGY.win);
      save();
      showToastMsg('🏳 Tu rival se rindió.');
      render();
      setTimeout(()=>showResult(true,false,p,e,[],false),400);
    }
  }else if(msg.t==='rematch'){
    if(!document.getElementById('mp-deck-ov')){
      document.getElementById('resov').classList.remove('active');
      MP.myDeck=null; MP.oppDeck=null; MP.deckSent=false; MP.oppReady=false;
      mpOpenDeckPicker();
    }
  }else if(msg.t==='trade_bye'){
    const tov=document.getElementById('mp-trade-ov'); if(tov)tov.remove();
    MPTRADE.active=false;
    showToastMsg('Tu rival salió del intercambio.');
    mpShowConnectedMenu();
  }
}
function mpBeginDuel(){
  MP.ready=true;
  const dov=document.getElementById('mp-deck-ov'); if(dov)dov.remove();
  const cellEl=[...MP.cellEl];
  G={board:Array(9).fill(null),cellEl,ph:[...MP.myDeck],eh:[...MP.oppDeck],sel:null,turn:'player',over:false,ps:5,es:5,did:null,online:true,perfectWin:false,energyGain:0,pendingCine:null};
  document.getElementById('elabel').textContent='🌐 Duelo en línea';
  const myTok=(AVATAR_IMG&&AVATAR_IMG[SAVE.avatar])||AVATAR_IMG.tomas;
  document.getElementById('dbanner').innerHTML=
    '<div class="dbanner">'
    +'<button class="duel-action-btn" id="muteBtn" onclick="toggleMute()" title="Música" style="margin-right:.6rem"><img class="ui-ic" data-ic="icon_soundon" src="'+UI_ICON.icon_soundon+'"></button>'
    +'<div class="dbside">'
    +'<div class="dbport" style="border-color:var(--pc)"><img src="'+myTok+'" alt="Tú"></div>'
    +'<div class="dbname" style="color:var(--pc)">Tú</div></div>'
    +'<div class="dbvs">VS</div>'
    +'<div class="dbside" style="flex-direction:row-reverse">'
    +'<div class="dbport" style="border-color:var(--ec)"><img src="'+(MP.oppTok||TOKEN.unknown)+'" alt="Rival"></div>'
    +'<div class="dbname" style="color:var(--ec)">Rival</div></div>'
    +'<button class="duel-action-btn" id="surrenderBtn" onclick="confirmSurrender()" title="Rendirse" style="margin-left:.6rem">🏳</button><button class="duel-action-btn" id="mpLeaveBtn" onclick="mpConfirmLeave()" title="Salir del duelo online" style="display:none;margin-left:.35rem">🚪</button>'
    +'</div>';
  document.getElementById('elemlegend2').innerHTML=legendHTML();
  showS('game-screen');
  document.getElementById('mpLeaveBtn').style.display='';
  startAmbient('normal');updateMuteBtn();
  clearLog();addLog('⚔ Duelo en línea — ¡Que comience!','ls');
  chatReset();
  render();
  mpFlipCoin(MP.iAmFirst);
}
function mpFlipCoin(iAmFirst){
  const ov=document.getElementById('coinov');
  const coin=document.getElementById('coinEl');
  const resEl=document.getElementById('coinResultText');
  const logoImg=document.getElementById('coinLogoImg');
  logoImg.src=document.querySelector('.logo-img').src;
  resEl.textContent='';resEl.classList.remove('show');
  coin.style.transition='none';coin.style.transform='rotateY(0deg)';
  void coin.offsetWidth;
  coin.style.transition='transform 1.7s cubic-bezier(.21,.98,.32,1.18)';
  ov.classList.add('active');
  G.turn=iAmFirst?'player':'enemy';
  render();
  const endRot=4*360+(iAmFirst?0:180);
  requestAnimationFrame(()=>{ coin.style.transform='rotateY('+endRot+'deg)'; });
  setTimeout(()=>{
    resEl.textContent=iAmFirst?'¡Cara! Empezás tú.':'¡Cruz! Empieza tu rival.';
    addLog(iAmFirst?'🪙 ¡Cara! Empezás tú.':'🪙 ¡Cruz! Empieza tu rival.', iAmFirst?'lf':'le');
    resEl.classList.add('show');
  },1750);
  setTimeout(()=>{ ov.classList.remove('active'); },2900);
}
function mpReceiveMove(ci,cid){
  if(!G.online||G.turn!=='enemy'||G.over)return;
  const idx=G.eh.indexOf(cid); if(idx>-1) G.eh.splice(idx,1);
  placeCapture(ci,cid,1);
  const c=CARDS.find(x=>x.id===cid);
  addLog('Tu rival juega '+c.name+' en posición '+(ci+1),'le');
  const cellDiv=document.querySelector('.cell[data-i="'+ci+'"]');
  if(cellDiv){const bcEl=cellDiv.querySelector('.bc');if(bcEl)bcEl.classList.add('place');}
  recalc();render();
  if(gameOver())return;
  G.turn='player';renderTurn();
}
function mpOnDisconnect(silent){
  if(MP._handled)return; // evitar avisos duplicados
  MP._handled=true;
  if(MP.ready && G && G.online && !G.over){
    // Se desconectó a mitad de un duelo activo
    G.over=true;
    if(!silent) showToastMsg('⚠ Tu rival se desconectó.');
    document.getElementById('ri').textContent='🔌';
    const rt=document.getElementById('rt'); rt.textContent='Rival desconectado'; rt.className='rt draw';
    document.getElementById('rs').textContent='';
    document.getElementById('rsub').textContent='Tu rival se desconectó antes de terminar. La partida no cuenta como derrota.';
    document.getElementById('rrew').style.display='none';
    document.getElementById('btnRematch').style.display='none';
    document.getElementById('btnMapa').style.display='none';
    document.getElementById('btnContinue').style.display='none';
    document.getElementById('btnMpExit').style.display='';
    const tb=document.getElementById('btnMpTrade'); if(tb)tb.style.display='none';
    const rb=document.getElementById('btnMpRematch'); if(rb)rb.style.display='none';
    stopAmbient();
    document.getElementById('resov').classList.add('active');
    mpTeardown();
  }else{
    // Se desconectó antes de empezar (en el lobby o eligiendo mazo)
    const lov=document.getElementById('mp-lobby-ov'); if(lov)lov.remove();
    const dov=document.getElementById('mp-deck-ov'); if(dov)dov.remove();
    const mov=document.getElementById('mp-menu-ov'); if(mov)mov.remove();
    const tov=document.getElementById('mp-trade-ov'); if(tov)tov.remove();
    showToastMsg('⚠ Tu rival se desconectó antes de empezar el duelo.');
    mpTeardown();
    showS('title-screen');
  }
}
function mpLeaveDeckPicker(){
  mpSend({t:'bye'});
  const dov=document.getElementById('mp-deck-ov'); if(dov)dov.remove();
  mpTeardown();
  showS('title-screen');
}
function mpConfirmLeave(){
  const ov=document.createElement('div');
  ov.className='sell-confirm';
  ov.innerHTML='<div class="sell-box"><h3>🚪 ¿Salir del duelo?</h3>'
    +'<p>Vas a abandonar la partida online. Tu rival va a ver que te desconectaste.</p>'
    +'<div class="sell-actions">'
    +'<button class="btn xs" onclick="mpLeaveDuel();document.body.removeChild(this.closest(\'.sell-confirm\'))">Sí, salir</button>'
    +'<button class="btn xs" style="border-color:rgba(255,255,255,.2);color:var(--td)" onclick="document.body.removeChild(this.closest(\'.sell-confirm\'))">Cancelar</button>'
    +'</div></div>';
  document.body.appendChild(ov);
}
function mpLeaveDuel(){
  mpSend({t:'bye'});
  stopAmbient();
  showS('title-screen');
  mpTeardown();
}

// ── INTERCAMBIO DE CARTAS ────────────────────────────────────
let MPTRADE={active:false,theirColl:null,myOffer:null,theirWant:null,incoming:null,pending:null};
function mpTradeCounts(coll){const m={};coll.forEach(id=>{m[id]=(m[id]||0)+1;});return m;}
function mpOpenTrade(){
  ['mp-menu-ov','mp-deck-ov'].forEach(id=>{const el=document.getElementById(id); if(el)el.remove();});
  const resov=document.getElementById('resov'); if(resov)resov.classList.remove('active');
  if(!MPTRADE.active){
    MPTRADE={active:true,theirColl:null,myOffer:null,theirWant:null,incoming:null,pending:null};
    mpSend({t:'trade_hello',coll:SAVE.coll});
  }
  let ov=document.getElementById('mp-trade-ov');
  if(!ov){
    ov=document.createElement('div');
    ov.id='mp-trade-ov';
    ov.style.cssText='position:fixed;inset:0;z-index:480;background:rgba(0,0,5,.96);display:flex;flex-direction:column;align-items:center;padding:1rem;overflow:hidden;';
    document.body.appendChild(ov);
  }
  mpRenderTrade();
}
function mpCloseTrade(){
  const ov=document.getElementById('mp-trade-ov'); if(ov)ov.remove();
  mpSend({t:'trade_bye'});
  MPTRADE={active:false,theirColl:null,myOffer:null,theirWant:null,incoming:null,pending:null};
  mpShowConnectedMenu();
}
function mpSelectMyOffer(cid){ MPTRADE.myOffer=(MPTRADE.myOffer===cid)?null:cid; mpRenderTrade(); }
function mpSelectTheirWant(cid){ MPTRADE.theirWant=(MPTRADE.theirWant===cid)?null:cid; mpRenderTrade(); }
function mpProposeTrade(){
  if(!MPTRADE.myOffer||!MPTRADE.theirWant)return;
  mpSend({t:'trade_offer',give:MPTRADE.myOffer,want:MPTRADE.theirWant});
  MPTRADE.pending='sent';
  mpRenderTrade();
}
function mpCancelProposal(){ MPTRADE.pending=null; mpSend({t:'trade_reject'}); mpRenderTrade(); }
function mpAcceptTrade(){
  const {give,want}=MPTRADE.incoming;
  const idx=SAVE.coll.indexOf(want);
  if(idx>-1) SAVE.coll.splice(idx,1);
  SAVE.coll.push(give);
  save();checkAvatarUnlocks();
  mpSend({t:'trade_accept'});
  const got=CARDS.find(c=>c.id===give);
  MPTRADE.incoming=null;
  showToastMsg('🔄 ¡Intercambio realizado! Recibiste '+(got?got.name:'una carta')+'.');
  mpRenderTrade();
}
function mpRejectTrade(){
  mpSend({t:'trade_reject'});
  MPTRADE.incoming=null;
  mpRenderTrade();
}
function mpTradeCardGrid(list, counts, selectedId, selFnName){
  if(list.length===0) return '<div style="text-align:center;font-family:Philosopher,serif;font-size:.66rem;color:var(--td);padding:.8rem">No hay cartas disponibles.</div>';
  return '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:.4rem;max-height:26vh;overflow-y:auto;padding:.2rem">'
    +list.map(cid=>{
      const c=CARDS.find(x=>x.id===cid); if(!c)return'';
      const sel=selectedId===cid;
      const last=counts[cid]===1;
      return '<div class="hc" style="width:100%;cursor:pointer;border:2px solid '+(sel?'#52b788':'rgba(255,255,255,.15)')+';position:relative;" onclick="'+selFnName+'(\''+cid+'\')">'
        +cardFace(c)
        +(last?'<div style="position:absolute;bottom:1px;left:1px;right:1px;background:rgba(232,93,4,.9);font-size:.4rem;text-align:center;border-radius:3px;color:#fff;font-family:Cinzel,serif;padding:1px 0;">única</div>':'')
        +'</div>';
    }).join('')
    +'</div>';
}
function mpRenderTrade(){
  const ov=document.getElementById('mp-trade-ov'); if(!ov)return;
  if(!MPTRADE.theirColl){
    ov.innerHTML='<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.8rem;">'
      +'<div style="font-family:Cinzel,serif;font-size:.8rem;color:#e0aaff">🔄 Esperando la colección de tu rival…</div>'
      +'<button class="btn xs" style="border-color:var(--td);color:var(--td)" onclick="mpCloseTrade()">✕ Cancelar</button></div>';
    return;
  }
  const pow=cid=>{const c=CARDS.find(x=>x.id===cid);return c?c.st*100+c.stats.reduce((a,b)=>a+b,0):0;};
  const myCounts=mpTradeCounts(SAVE.coll);
  const theirCounts=mpTradeCounts(MPTRADE.theirColl);
  const myOfferable=Object.keys(myCounts).filter(cid=>myCounts[cid]>=2&&CARDS.find(c=>c.id===cid)).sort((a,b)=>pow(a)-pow(b));
  const theirList=Object.keys(theirCounts).filter(cid=>CARDS.find(c=>c.id===cid)).sort((a,b)=>pow(a)-pow(b));

  let html='<div style="width:100%;max-width:440px;height:100%;display:flex;flex-direction:column;overflow-y:auto;">'
    +'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.4rem">'
    +'<button class="btn xs" style="border-color:var(--td);color:var(--td)" onclick="mpCloseTrade()">← Volver</button>'
    +'<div style="font-family:\'Cinzel Decorative\',serif;font-size:.82rem;color:#e0aaff;text-align:center;flex:1">🔄 Intercambio</div>'
    +'<div style="width:64px"></div></div>';

  if(MPTRADE.incoming){
    const giveCard=CARDS.find(c=>c.id===MPTRADE.incoming.give);
    const wantCard=CARDS.find(c=>c.id===MPTRADE.incoming.want);
    const losingLast=myCounts[wantCard.id]===1;
    html+='<div style="background:rgba(224,170,255,.08);border:1.5px solid rgba(224,170,255,.4);border-radius:10px;padding:.7rem;margin-bottom:.6rem;text-align:center;">'
      +'<div style="font-family:Cinzel,serif;font-size:.72rem;color:#e0aaff;margin-bottom:.5rem">Tu rival te propone un intercambio:</div>'
      +'<div style="display:flex;align-items:center;justify-content:center;gap:.7rem;margin-bottom:.5rem">'
      +'<div style="width:80px"><div style="font-size:.58rem;color:var(--td);margin-bottom:.2rem">Recibís</div><div class="hc" style="width:80px;border-color:#52b788">'+cardFace(giveCard)+'</div></div>'
      +'<div style="font-size:1.2rem;color:var(--td)">⇄</div>'
      +'<div style="width:80px"><div style="font-size:.58rem;color:var(--td);margin-bottom:.2rem">Entregás</div><div class="hc" style="width:80px;border-color:#e85d04">'+cardFace(wantCard)+'</div></div>'
      +'</div>'
      +(losingLast?'<div style="font-size:.62rem;color:#ff8a8a;margin-bottom:.5rem">⚠ Es tu única copia de '+wantCard.name+'.</div>':'')
      +'<div style="display:flex;gap:.5rem;justify-content:center">'
      +'<button class="btn xs" style="border-color:#52b788;color:#52b788" onclick="mpAcceptTrade()">✓ Aceptar</button>'
      +'<button class="btn xs" style="border-color:#e85d04;color:#e85d04" onclick="mpRejectTrade()">✕ Rechazar</button>'
      +'</div></div>';
  }

  if(MPTRADE.pending==='sent'){
    const giveCard=CARDS.find(c=>c.id===MPTRADE.myOffer);
    const wantCard=CARDS.find(c=>c.id===MPTRADE.theirWant);
    html+='<div style="background:rgba(127,216,255,.08);border:1.5px solid rgba(127,216,255,.35);border-radius:10px;padding:.6rem;margin-bottom:.6rem;text-align:center;">'
      +'<div style="font-family:Cinzel,serif;font-size:.68rem;color:#7fd8ff">⏳ Esperando que tu rival responda tu propuesta…</div>'
      +'<div style="font-size:.6rem;color:var(--td);margin-top:.2rem">Ofrecés '+(giveCard?giveCard.name:'')+' · Pedís '+(wantCard?wantCard.name:'')+'</div>'
      +'<button class="btn xs" style="margin-top:.4rem;border-color:var(--td);color:var(--td)" onclick="mpCancelProposal()">Cancelar propuesta</button>'
      +'</div>';
  }else{
    html+='<div style="font-family:Cinzel,serif;font-size:.68rem;color:var(--pc);margin:.3rem 0 .2rem;text-align:center">Tu carta a ofrecer <span style="color:var(--td);font-family:Philosopher,serif;font-size:.6rem">(no se puede tu última copia)</span></div>'
      +mpTradeCardGrid(myOfferable,myCounts,MPTRADE.myOffer,'mpSelectMyOffer')
      +'<div style="font-family:Cinzel,serif;font-size:.68rem;color:var(--ec);margin:.5rem 0 .2rem;text-align:center">Carta que querés de tu rival</div>'
      +mpTradeCardGrid(theirList,theirCounts,MPTRADE.theirWant,'mpSelectTheirWant')
      +'<button class="btn sm" style="margin-top:.6rem;border-color:#e0aaff;color:#e0aaff" '+((MPTRADE.myOffer&&MPTRADE.theirWant)?'':'disabled')+' onclick="mpProposeTrade()">🔄 Proponer intercambio</button>';
  }
  html+='</div>';
  ov.innerHTML=html;
}

function mpRematch(){
  document.getElementById('resov').classList.remove('active');
  MP.myDeck=null; MP.oppDeck=null; MP.deckSent=false; MP.oppReady=false;
  mpOpenDeckPicker();
  mpSend({t:'rematch'});
}
function mpBackToTitle(){
  mpSend({t:'bye'}); // avisarle al rival que la sesión terminó, antes de cortar
  document.getElementById('resov').classList.remove('active');
  showS('title-screen');
  mpTeardown();
}
