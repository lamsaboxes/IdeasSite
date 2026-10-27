"use strict";
/* صور تختفي بهدوء إذا ما انوجدت بدل ما تطلع مكسورة */
document.querySelectorAll('img[data-hide-on-error],img[data-hide-parent-on-error]').forEach(img => {
  const hide = () => { (img.hasAttribute('data-hide-parent-on-error') ? img.parentNode : img).hidden = true; };
  if (img.complete && img.naturalWidth === 0) hide(); else img.addEventListener('error', hide);
});

/* =======================================================
   0) صور المشهد — ضعي روابط صورك هنا
   -------------------------------------------------------
   • sun     : صورة الشمس (PNG بخلفية شفافة). تمر الغيوم قدّامها.
   • sunSpin : true = تدور ببطء ، false = ثابتة مع توهّج فقط
   • clouds  : صور الغيوم (PNG بخلفية شفافة). أطرافها تتنعّم تلقائيًا.
   • flowers : نباتات المرج. كل وحدة تقدر تكون رابط بس، أو
               { src: "الرابط", size: الحجم } لو تبين نبتة أكبر أو أصغر
               من غيرها. الصورة الأفضل تكون النبتة كاملة وأسفل ساقها
               في أسفل الصورة (ملفات مجلد plants جاهزة بهالشكل).
   • flowerScale  : حجم كل النباتات مع بعض (1 = عادي)
   • flowerDensity: كثافتها (1 = عادي، 0.6 = أقل، 1.4 = أكثر)
   اتركي أي خانة فاضية ("" أو []) وبيرجع للرسمة الأصلية.
   ======================================================= */
const SCENE = {
  sun: "4.png",
  sunSpin: true,
  logoSunSize: 1.5,      // حجم الشمس في الشعار اللي يطلع آخر المشهد
  clouds: ["1.png", "2.png", "3.png"],

  flowers: [
    // weight = كم مرة تتكرر مقارنة بغيرها (الأكبر = أكثر)
    { src: "ورود بيضاء.png",  size: 0.95, weight: 5 },  // الأساس: بيضاء ناعمة
    { src: "زهرة زرقاء.png",  size: 0.8,  weight: 3 },  // لمسات بنفسجية فاتحة
    { src: "وردة صفراء.png",  size: 0.7,  weight: 1.5 } // لمعات صفراء قليلة
    // لو تبين ترجعينها، شيلي // من أول السطر:
    // ,{ src: "ورد بنفسجي.png",       size: 1.1, weight: 1 }
    // ,{ src: "وردة زرقاء نائمة.png", size: 1,   weight: 1 }
  ],
  flowerScale: 1,
  meadowSeed: 1,       // رقم ترتيب المرج: كل رقم يعطي ترتيب ثابت مختلف (جرّبي 1، 2، 3...)
  flowerDensity: 0.75
};

/* إرسال "شاركنا لمستك": اكتبي إيميلكم هنا، والصور توصلكم عليه مجانًا (FormSubmit) */
const SHARE = {
  email: "lamsaboxes@gmail.com",   // إيميلكم، أو الرمز السري اللي يعطيكم إياه FormSubmit بعد التفعيل (أأمن)
  boxes: ["صندوق تلوين الأكواب والأطباق"]       // أنواع الصناديق في القائمة
};

/* حسابات التواصل في الفوتر */
const LINKS = {
  instagram: "lamsaboxes",
  tiktok: "lamsaboxes",
  store: ""          // رابط متجركم لما يجهز، مثال: "https://lamsa.store"
};

/* =======================================================
   1) DATA — عدّلي هنا: الفئات، الألوان، والأفكار.
   لإضافة صورة حقيقية لأي فكرة أضيفي: img: "رابط الصورة"
   ======================================================= */
const PAL = {
  sunset:{n:'غروب الحديقة',mood:'bright',c:['#E3809A','#F7C531','#E8956E','#FFF1E6'],cn:['وردي','أصفر شمسي','مشمشي','كريمي']},
  sea:{n:'بحر جدة',mood:'calm',c:['#2F6F8F','#8FC7CF','#E9A21B','#F1F6F4'],cn:['أزرق بحري','فيروزي','ذهبي','رغوة']},
  clay:{n:'طين ونخيل',mood:'earthy',c:['#B5653A','#6E8B3D','#D9A56E','#F5E8D4'],cn:['طين','أخضر نخيل','كراميل','رملي فاتح']},
  lav:{n:'خزامى',mood:'calm',c:['#8E6CC0','#C8B6E8','#7DB24C','#F6F1FB'],cn:['بنفسجي','خزامى','أخضر','أبيض ليلكي']},
  lemon:{n:'ليمون',mood:'bright',c:['#F2C230','#5E9438','#2F5D50','#FFFBEA'],cn:['ليموني','أخضر ورق','زيتي غامق','أبيض دافئ']},
  navy:{n:'كحلي وذهبي',mood:'calm',c:['#24305E','#E9A21B','#8EA2CA','#F4EFE6'],cn:['كحلي','ذهبي','أزرق رمادي','عاجي']},
  berry:{n:'فراولة',mood:'bright',c:['#D9465A','#F7B2BD','#4F8A3A','#FFF6F2'],cn:['فراولي','وردي فاتح','أخضر','حليبي']},
  sand:{n:'رمل الصحراء',mood:'earthy',c:['#C38A55','#E5C49A','#8C5E36','#FAF2E6'],cn:['رملي','بيج','بني','أبيض رملي']}
};
const MOODS = {calm:'هادئة',bright:'مشرقة',earthy:'ترابية'};
const MOOD_DOT = {calm:'#8FC7CF',bright:'#F7C531',earthy:'#C38A55'};

const BOX_ALL = ['كوب سيراميك أبيض','صحن سيراميك','ألوان سيراميك','فرشاتين','قلم تحديد','بطاقة الخطوات'];
const CATS = [
  {id:'all',name:'كل الأفكار',short:'الكل',
   desc:'كل أفكار لمسة في مكان واحد، أكواب وأطباق. اختر اللي يعجبك وابدأ.',
   box:BOX_ALL,time:'ساعة إلى ساعتين لكل قطعة'},
  {id:'mugs',name:'الرسم على الأكواب',short:'الأكواب',kind:'mug',
   desc:'كوب سيراميك أبيض تحوّله لكوبك الخاص، تشرب فيه قهوتك كل صباح.',
   box:['كوب سيراميك أبيض','ألوان سيراميك','فرشاتين','قلم تحديد','بطاقة الخطوات'],time:'ساعة تقريبًا، ويوم كامل للتجفيف',
   steps:['امسح الكوب بقطعة قماش وكحول عشان يمسك اللون','ارسم النقشة بقلم التحديد أو الرصاص قبل ما تلوّن','لوّن واتركه يجف، وبعدها ثبّت اللون حسب تعليمات البطاقة']},
  {id:'plates',name:'الرسم على الأطباق',short:'الأطباق',kind:'plate',
   desc:'صحن أبيض تحوّله لقطعة تحطها على طاولتك أو تعلّقها على الجدار.',
   box:['صحن سيراميك ٢٠ سم','ألوان سيراميك','قلم تحديد','فرشاة نقاط','ورنيش لامع'],time:'ساعتين، ويوم كامل للتجفيف',
   steps:['امسح الصحن بقطعة قماش ناعمة','ارسم الخطوط الرئيسية بقلم التحديد من المركز للأطراف','عبّئ الألوان واتركه يوم كامل قبل الورنيش']}
];

const IDEAS = [
  // الأكواب
  {id:'m1',cat:'mugs',t:'صباح الليمون',m:'lemons',p:'lemon',lv:'سهل',min:45,note:'ليمونات صغيرة بأوراقها حول الكوب، تفتح النفس مع قهوة الصباح.',tip:'ارسم الليمونة بضربتين بالفرشاة العريضة، والورقة بضغطة وحدة.'},
  {id:'m2',cat:'mugs',t:'نقاط الخزامى',m:'dots',p:'lav',lv:'سهل',min:30,note:'نقاط بلونين على بنفسجي هادئ، أسهل فكرة وأحلاها.',tip:'استخدم طرف الفرشاة الخلفي عشان تطلع النقاط بنفس الحجم.'},
  {id:'m3',cat:'mugs',t:'خطوط البحر',m:'stripes',p:'sea',lv:'سهل',min:35,note:'أشرطة أزرق وفيروزي حول الكوب، شكلها مرتب وما تحتاج خبرة.',tip:'شريط لاصق ورقي يعطيك خطوط مستقيمة بدون تعب.'},
  {id:'m4',cat:'mugs',t:'حقل ديزي',m:'daisy',p:'sunset',lv:'متوسط',min:60,note:'زهور بيضاء صغيرة على وردي، كأن الكوب مرج صغير.',tip:'الوسط الأصفر آخر شي، بعد ما تجف البتلات.'},
  {id:'m5',cat:'mugs',t:'فراولة الصيف',m:'strawberry',p:'berry',lv:'متوسط',min:60,note:'حبات فراولة متناثرة بأوراقها، كوب يفتح الشهية.',tip:'البذور نقاط بيضاء بعود أسنان.'},
  {id:'m6',cat:'mugs',t:'قهوتي',m:'word',word:'قهوتي',p:'clay',lv:'متوسط',min:50,note:'كلمة وحدة بخط كبير تخلي الكوب لك أنت بس.',tip:'اكتب الكلمة على ورق وشفّها بالرصاص قبل التلوين.'},
  {id:'m7',cat:'mugs',t:'موج الليل',m:'waves',p:'navy',lv:'متوسط',min:55,note:'موج ذهبي وفاتح على كحلي غامق، هادي ومرتب.',tip:'ارسم موجة وحدة بالرصاص وكررها، أسهل من الرسم الحر.'},
  {id:'m8',cat:'mugs',t:'قلوب صغيرة',m:'hearts',p:'sunset',lv:'سهل',min:30,note:'قلوب متناثرة بلونين، هدية جاهزة لأحد تحبه.',tip:'القلب نقطتين ومثلث تحتهم، بعدها اربطهم.'},
  // الأطباق
  {id:'p1',cat:'plates',t:'ليمون الصيف',m:'lemons',p:'lemon',lv:'متوسط',min:90,note:'ثلاث ليمونات وشريحة في الوسط، وأوراق خضراء تدور حول الحافة.',tip:'لوّن الليمون بطبقتين، والثانية أفتح على طرف واحد عشان يطلع لامع.'},
  {id:'p2',cat:'plates',t:'ماندالا النقاط',m:'mandala',p:'lav',lv:'متقدم',min:120,note:'حلقات نقاط تكبر من المركز للأطراف بثلاث درجات بنفسجي.',tip:'علّم المركز وارسم دوائر خفيفة بالرصاص كدليل للحلقات.'},
  {id:'p3',cat:'plates',t:'سمكة البحر الأحمر',m:'fish',p:'sea',lv:'متوسط',min:80,note:'سمكة واحدة في وسط الصحن، وفقاعات وموج خفيف حولها.',tip:'القشور أقواس صغيرة بقلم التحديد بعد ما يجف اللون.'},
  {id:'p4',cat:'plates',t:'أغصان',m:'botanic',p:'clay',lv:'متوسط',min:90,note:'ثمانية أغصان تطلع من المركز، كأن الصحن غصن نخيل مفروش.',tip:'ارسم الساق أولاً، وبعدها الأوراق بضغطة فرشاة وحدة.'},
  {id:'p5',cat:'plates',t:'شمس الظهيرة',m:'sun',p:'sunset',lv:'سهل',min:60,note:'شمس كبيرة بأشعة بلونين، وحافة متقطعة بالوردي.',tip:'الأشعة مثلثات، والتناوب بين لونين يعطيها حركة.'},
  {id:'p6',cat:'plates',t:'رقعة الذهب',m:'checker',p:'navy',lv:'متقدم',min:110,note:'حافة مقسمة لمربعات كحلي وعاجي، ونجمة ذهبية في المنتصف.',tip:'قسّم الحافة بالمسطرة لأربعة، وبعدها كل ربع لستة.'},
  {id:'p7',cat:'plates',t:'أغصان الفراولة',m:'botanic',p:'berry',lv:'متوسط',min:90,note:'نفس فكرة الأغصان، بس بأحمر ووردي يفتح النفس على طاولة الفطور.',tip:'نقطة بيضاء صغيرة على كل ورقة تعطيها لمعة.'},
  {id:'p8',cat:'plates',t:'حلقات الرمل',m:'rings',p:'sand',lv:'سهل',min:45,note:'دوائر متداخلة بثلاث درجات رملي، هادئة وتناسب أي صحن تقديم.',tip:'لف الصحن بيدك والفرشاة ثابتة، تطلع الدائرة لحالها.'},
];

/* =======================================================
   2) GENERATIVE ART — رسومات مولّدة لكل فكرة
   ======================================================= */
let UID = 0;
function rngFor(str){let h=1779033703^str.length;for(let i=0;i<str.length;i++){h=Math.imul(h^str.charCodeAt(i),3432918353);h=h<<13|h>>>19}return function(){h=Math.imul(h^h>>>16,2246822507);h=Math.imul(h^h>>>13,3266489909);h^=h>>>16;return (h>>>0)/4294967296}}
const f = n => Math.round(n*10)/10;
let NOBG = false;
function bgRect(u,l,m){if(NOBG)return '';return `<defs><radialGradient id="bg${u}" cx=".25" cy=".15" r="1.1"><stop offset="0" stop-color="#fff" stop-opacity=".85"/><stop offset=".55" stop-color="${l}" stop-opacity="0"/><stop offset="1" stop-color="${m}" stop-opacity=".22"/></radialGradient></defs><rect width="100%" height="100%" fill="${l}"/><rect width="100%" height="100%" fill="url(#bg${u})"/>`}
function daisy(x,y,r,petal,center,stroke){let o='';for(let i=0;i<8;i++)o+=`<ellipse cx="${f(x)}" cy="${f(y-r*.55)}" rx="${f(r*.22)}" ry="${f(r*.5)}" fill="${petal}"${stroke?` stroke="${stroke}" stroke-width="1.2"`:''} transform="rotate(${i*45} ${f(x)} ${f(y)})"/>`;return o+`<circle cx="${f(x)}" cy="${f(y)}" r="${f(r*.28)}" fill="${center}"/>`}
function blob(cx,cy,rx,ry,rng,n=10,j=.07){const p=[];for(let i=0;i<n;i++){const a=i/n*Math.PI*2,k=1+(rng()-.5)*2*j;p.push([cx+Math.cos(a)*rx*k,cy+Math.sin(a)*ry*k])}let d='';for(let i=0;i<n;i++){const a=p[i],b=p[(i+1)%n],mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2;if(i===0){const z=p[n-1];d+=`M${f((z[0]+a[0])/2)} ${f((z[1]+a[1])/2)}`}d+=`Q${f(a[0])} ${f(a[1])} ${f(mx)} ${f(my)}`}return d+'Z'}
function heartPath(x,y,s){return `M${f(x)} ${f(y+s*.35)} C${f(x-s*.9)} ${f(y-s*.25)} ${f(x-s*.45)} ${f(y-s*.9)} ${f(x)} ${f(y-s*.4)} C${f(x+s*.45)} ${f(y-s*.9)} ${f(x+s*.9)} ${f(y-s*.25)} ${f(x)} ${f(y+s*.35)}Z`}
function arches(cx,cy,rs,cols){return rs.map((r,i)=>`<path d="M${cx-r} ${cy} A${r} ${r} 0 0 1 ${cx+r} ${cy}Z" fill="${cols[i%cols.length]}"/>`).join('')}

const G = ['#5E9438','#7DB24C','#6FA046','#4F8530'];
function plant(kind,c,rng){
  const [m,s,a,l]=c; let o='';
  if(kind==='succulent'){
    [[66,15,'#7FAF8A',9],[50,12,'#94C39D',7],[32,10,'#AED5B2',5]].forEach(([len,rx,col,n],k)=>{
      for(let i=0;i<n;i++){const th=-80+i*160/(n-1)+(k%2?8:0);o+=`<ellipse cx="150" cy="${186-len/2}" rx="${rx}" ry="${len/2}" fill="${col}" stroke="#5E8A68" stroke-width="1" transform="rotate(${th} 150 186)"/>`}
    });
    o+=`<circle cx="150" cy="178" r="5" fill="${s}"/>`;
  }else if(kind==='herb'){
    [[118,78],[150,58],[184,84]].forEach(([x,y],k)=>{
      o+=`<path d="M150 190 Q${(150+x)/2} ${(190+y)/2+10} ${x} ${y}" stroke="#4F8530" stroke-width="4" fill="none" stroke-linecap="round"/>`;
      [.35,.6,.85,1].forEach((t,j)=>{const px=150+(x-150)*t,py=190+(y-190)*t;const sz=1-t*.35;
        o+=`<ellipse cx="${f(px-10*sz)}" cy="${f(py)}" rx="${f(10*sz)}" ry="${f(15*sz)}" fill="${G[(j+k)%4]}" transform="rotate(-40 ${f(px)} ${f(py)})"/><ellipse cx="${f(px+10*sz)}" cy="${f(py)}" rx="${f(10*sz)}" ry="${f(15*sz)}" fill="${G[(j+k+1)%4]}" transform="rotate(40 ${f(px)} ${f(py)})"/>`});
    });
  }else if(kind==='cactus'){
    o+=`<rect x="96" y="108" width="26" height="50" rx="13" fill="#6E9F55"/><rect x="108" y="140" width="28" height="16" rx="6" fill="#6E9F55"/><rect x="178" y="94" width="26" height="52" rx="13" fill="#78A85E"/><rect x="164" y="128" width="26" height="16" rx="6" fill="#78A85E"/><rect x="127" y="64" width="46" height="128" rx="23" fill="#6E9F55"/>`;
    o+=`<path d="M140 76V186M150 70V188M160 76V186" stroke="#5A8A44" stroke-width="2"/>`;
    for(let i=0;i<10;i++)o+=`<path d="M${f(132+rng()*36)} ${f(80+rng()*100)} l3 -3" stroke="#F4F0E0" stroke-width="1.6" stroke-linecap="round"/>`;
    o+=daisy(150,64,16,a,s);
  }else if(kind==='monstera'){
    [[-52,96,120],[-16,140,66],[22,170,74],[56,206,118]].forEach(([rot,x,y],k)=>{
      o+=`<path d="M150 190 Q${(150+x)/2} ${(190+y)/2} ${x} ${y}" stroke="#4F8530" stroke-width="4" fill="none"/>`;
      o+=`<g transform="translate(${x} ${y}) rotate(${rot})"><path d="M0 0 C-34 -8 -44 -56 0 -78 C44 -56 34 -8 0 0Z" fill="${G[k%4]}"/><path d="M0 -4 V-70" stroke="#A9D18A" stroke-width="2"/><path d="M-30 -40 L-12 -36 M30 -40 L12 -36 M-26 -22 L-10 -22" stroke="${l}" stroke-width="3" stroke-linecap="round"/></g>`;
    });
  }else{
    [[122,92,a],[150,70,m],[180,96,s]].forEach(([x,y,col])=>{
      o+=`<path d="M150 190 Q${(150+x)/2} ${(190+y)/2+12} ${x} ${y}" stroke="#4F8530" stroke-width="3.5" fill="none"/><ellipse cx="${(150+x)/2+8}" cy="${(190+y)/2+16}" rx="7" ry="14" fill="#6FA046" transform="rotate(40 ${(150+x)/2+8} ${(190+y)/2+16})"/>`;
      o+=daisy(x,y,20,col,'#FFF3C4');
    });
  }
  return o;
}
function potPattern(mo,c,rng){
  const [m,s,a,l]=c, X=70,Y=196,W=160,H=140; const R=col=>`<rect x="60" y="190" width="180" height="150" fill="${col}"/>`; let o='';
  switch(mo){
    case 'dots':o+=R(m);for(let r=0;r<7;r++)for(let i=0;i<10;i++)o+=`<circle cx="${X+4+i*18+(r%2?9:0)}" cy="${Y+12+r*20}" r="5.5" fill="${r%2?l:s}"/>`;break;
    case 'waves':o+=R(l);for(let k=0;k<5;k++){let d=`M${X-10} ${Y+18+k*26}`;for(let i=0;i<9;i++)d+=` q10 -12 20 0`;o+=`<path d="${d}" stroke="${k%2?s:m}" stroke-width="8" fill="none" stroke-linecap="round"/>`}break;
    case 'stripes':[m,l,s,l,a,l,m,l].forEach((col,k)=>o+=`<rect x="60" y="${Y+k*18}" width="180" height="18" fill="${col}"/>`);break;
    case 'daisies':o+=R(s);for(let r=0;r<3;r++)for(let i=0;i<4;i++)o+=daisy(X+22+i*42+(r%2?21:0),Y+28+r*44,17,'#fff',a);break;
    case 'checks':o+=R(l);for(let i=0;i<8;i++)o+=`<rect x="${X+i*24}" y="${Y}" width="12" height="${H}" fill="${m}" opacity=".42"/><rect x="60" y="${Y+i*24}" width="180" height="12" fill="${m}" opacity=".42"/>`;break;
    case 'arches':o+=R(l)+arches(150,Y+H,[110,84,58,32],[m,a,s,l]);break;
    case 'face':o+=R(m)+`<path d="M114 244q9 9 18 0M168 244q9 9 18 0M138 268q12 12 24 0" stroke="#2B2730" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="110" cy="262" r="10" fill="${a}" opacity=".85"/><circle cx="190" cy="262" r="10" fill="${a}" opacity=".85"/>`;break;
  }
  return o;
}
function potArt(it,P,rng,u){
  const c=P.c, body='M80 196 L220 196 L206 318 Q204 330 192 330 L108 330 Q96 330 94 318 Z';
  const rim = it.m==='checks'||it.m==='waves'||it.m==='arches'?c[0]:(it.m==='stripes'?c[2]:c[3]);
  return `<svg viewBox="0 0 300 360" xmlns="http://www.w3.org/2000/svg">${bgRect(u,c[3],c[0])}
  <ellipse cx="150" cy="336" rx="96" ry="12" fill="#3a2a1a" opacity=".13"/>${plant(it.plant,c,rng)}
  <defs><clipPath id="cp${u}"><path d="${body}"/></clipPath></defs>
  <g clip-path="url(#cp${u})">${potPattern(it.m,c,rng)}<rect x="60" y="190" width="180" height="150" fill="url(#shadeX)"/></g>
  <path d="${body}" fill="none" stroke="rgba(0,0,0,.08)" stroke-width="2"/>
  <rect x="68" y="176" width="164" height="28" rx="9" fill="${rim}"/><rect x="68" y="176" width="164" height="28" rx="9" fill="url(#shadeX)"/><rect x="76" y="180" width="148" height="4" rx="2" fill="#fff" opacity=".35"/>
  <rect x="80" y="204" width="140" height="6" fill="#000" opacity=".08"/></svg>`;
}
function polar(cx,cy,r,deg){const a=(deg-90)*Math.PI/180;return [f(cx+Math.cos(a)*r),f(cy+Math.sin(a)*r)]}
function plateArt(it,P,rng,u){
  const [m,s,a,l]=P.c, C=160; let o='';
  const rimBand=(col,w,dash)=>`<circle cx="${C}" cy="${C}" r="118" fill="none" stroke="${col}" stroke-width="${w}"${dash?` stroke-dasharray="${dash}"`:''}/>`;
  switch(it.m){
    case 'lemons':
      for(let i=0;i<18;i++){const [x,y]=polar(C,C,118,i*20);o+=`<ellipse cx="${x}" cy="${y}" rx="5" ry="11" fill="${s}" transform="rotate(${i*20+40} ${x} ${y})"/>`}
      [[-38,-26,-30],[34,-30,25],[-4,30,70]].forEach(([dx,dy,r])=>{o+=`<g transform="translate(${C+dx} ${C+dy}) rotate(${r})"><ellipse rx="27" ry="20" fill="${m}"/><ellipse cx="27" rx="5" ry="4" fill="${m}"/><ellipse cx="-8" cy="-6" rx="8" ry="4" fill="#fff" opacity=".45"/><ellipse cx="-14" cy="-24" rx="7" ry="14" fill="${s}" transform="rotate(-50 -14 -24)"/></g>`});
      o+=`<circle cx="${C+38}" cy="${C+30}" r="22" fill="${m}"/><circle cx="${C+38}" cy="${C+30}" r="18" fill="#FFF6C9"/>`;for(let i=0;i<8;i++){const [x,y]=polar(C+38,C+30,17,i*45);o+=`<path d="M${C+38} ${C+30}L${x} ${y}" stroke="${m}" stroke-width="2"/>`}
      break;
    case 'mandala':
      o+=rimBand(m,10)+rimBand(l,3,'2 7');
      for(let k=0;k<5;k++){const r=18+k*17,n=6+k*6,cols=[m,s,a];for(let i=0;i<n;i++){const [x,y]=polar(C,C,r,i*360/n+(k%2?180/n:0));o+=`<circle cx="${x}" cy="${y}" r="${f(6.5-k*.7)}" fill="${cols[k%3]}"/>`}}
      o+=`<circle cx="${C}" cy="${C}" r="9" fill="${a}"/>`;break;
    case 'fish':
      o+=rimBand(s,12,'3 9');
      o+=`<path d="M${C-70} ${C+48} q15 -10 30 0 t30 0 t30 0 t30 0 t30 0" stroke="${s}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
      o+=`<g transform="translate(${C} ${C-6})"><path d="M48 0 L78 -24 L74 0 L78 24Z" fill="${a}"/><ellipse rx="58" ry="32" fill="${m}"/>`;
      for(let r=0;r<2;r++)for(let i=0;i<4;i++)o+=`<path d="M${-14+i*14} ${-12+r*18} a8 8 0 0 0 0 14" stroke="${s}" stroke-width="2.5" fill="none"/>`;
      o+=`<circle cx="-36" cy="-6" r="7" fill="#fff"/><circle cx="-37" cy="-6" r="3.5" fill="#1d2433"/><path d="M-58 6 q6 4 10 0" stroke="#1d2433" stroke-width="2" fill="none"/></g>`;
      [[C-74,C-52,8],[C-88,C-74,5],[C-64,C-86,4]].forEach(([x,y,r])=>o+=`<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${s}" stroke-width="2.5"/>`);break;
    case 'botanic':
      for(let i=0;i<8;i++){const ang=i*45;o+=`<g transform="rotate(${ang} ${C} ${C})"><path d="M${C} ${C-24} V${C-100}" stroke="${s}" stroke-width="3"/>`;
        for(let j=0;j<4;j++){const y=C-38-j*16,sz=9-j*1.2;o+=`<ellipse cx="${C-sz}" cy="${y}" rx="${f(sz*.55)}" ry="${f(sz)}" fill="${j%2?m:s}" transform="rotate(-45 ${C} ${y})"/><ellipse cx="${C+sz}" cy="${y}" rx="${f(sz*.55)}" ry="${f(sz)}" fill="${j%2?s:m}" transform="rotate(45 ${C} ${y})"/>`}
        o+=`<circle cx="${C}" cy="${C-104}" r="4.5" fill="${a}"/></g>`}
      o+=`<circle cx="${C}" cy="${C}" r="14" fill="${a}"/><circle cx="${C}" cy="${C}" r="6" fill="${m}"/>`;break;
    case 'sun':
      o+=rimBand(m,14,'16 10');
      for(let i=0;i<16;i++){const [x1,y1]=polar(C,C,44,i*22.5-6),[x2,y2]=polar(C,C,44,i*22.5+6),[x3,y3]=polar(C,C,82,i*22.5);o+=`<path d="M${x1} ${y1}L${x3} ${y3}L${x2} ${y2}Z" fill="${i%2?m:a}"/>`}
      o+=`<circle cx="${C}" cy="${C}" r="40" fill="${s}"/><path d="M${C-14} ${C-6}q5 5 10 0M${C+4} ${C-6}q5 5 10 0M${C-10} ${C+10}q10 9 20 0" stroke="#5A3A1E" stroke-width="3" fill="none" stroke-linecap="round"/>`;break;
    case 'checker':
      for(let i=0;i<24;i++){const a0=i*15,a1=a0+15,[x1,y1]=polar(C,C,106,a0),[x2,y2]=polar(C,C,130,a0),[x3,y3]=polar(C,C,130,a1),[x4,y4]=polar(C,C,106,a1);o+=`<path d="M${x1} ${y1}L${x2} ${y2}A130 130 0 0 1 ${x3} ${y3}L${x4} ${y4}A106 106 0 0 0 ${x1} ${y1}Z" fill="${i%2?l:m}"/>`}
      o+=`<circle cx="${C}" cy="${C}" r="52" fill="none" stroke="${a}" stroke-width="2" stroke-dasharray="3 6"/>`;
      {let d='';for(let i=0;i<8;i++){const [x,y]=polar(C,C,i%2?14:38,i*45);d+=(i?'L':'M')+x+' '+y}o+=`<path d="${d}Z" fill="${s}"/><circle cx="${C}" cy="${C}" r="6" fill="${m}"/>`}break;
    case 'rings':
      [96,80,64,48,32,16].forEach((r,i)=>o+=`<circle cx="${C}" cy="${C}" r="${r}" fill="none" stroke="${[m,s,a][i%3]}" stroke-width="${i%2?5:8}"/>`);
      for(let i=0;i<36;i++){const [x,y]=polar(C,C,118,i*10);o+=`<circle cx="${x}" cy="${y}" r="2.6" fill="${m}"/>`}break;
  }
  return `<svg viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg">${bgRect(u,l,m)}
  <ellipse cx="${C+8}" cy="${C+12}" rx="134" ry="134" fill="#3a2a1a" opacity=".1"/>
  <circle cx="${C}" cy="${C}" r="134" fill="#FCFAF6" stroke="#E5DCCD" stroke-width="2"/><circle cx="${C}" cy="${C}" r="104" fill="#FFFEFB" stroke="#EEE6D9" stroke-width="2"/>
  ${o}<ellipse cx="${C-58}" cy="${C-70}" rx="40" ry="16" fill="#fff" opacity=".35" transform="rotate(-35 ${C-58} ${C-70})"/></svg>`;
}
function canvasArt(it,P,rng,u){
  const [m,s,a,l]=P.c; let o=''; const X=58,Y=36,W=184,H=240;
  switch(it.m){
    case 'hills':
      o+=`<defs><linearGradient id="sk${u}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${l}"/><stop offset="1" stop-color="${s}" stop-opacity=".55"/></linearGradient></defs><rect x="${X}" y="${Y}" width="${W}" height="${H}" fill="url(#sk${u})"/>`;
      o+=`<circle cx="190" cy="104" r="26" fill="${a}"/><ellipse cx="110" cy="90" rx="26" ry="9" fill="#fff" opacity=".8"/>`;
      o+=`<path d="M${X} 190 Q110 150 160 176 T${X+W} 168 V${Y+H} H${X}Z" fill="${s}"/><path d="M${X} 220 Q120 186 180 214 T${X+W} 206 V${Y+H} H${X}Z" fill="${m}" opacity=".85"/><path d="M${X} 250 Q140 222 ${X+W} 246 V${Y+H} H${X}Z" fill="${m}"/>`;break;
    case 'arches':
      o+=`<rect x="${X}" y="${Y}" width="${W}" height="${H}" fill="${l}"/>`+arches(150,Y+H-20,[78,60,42,24],[m,s,a,l])+`<rect x="${X}" y="${Y+H-20}" width="${W}" height="20" fill="${s}" opacity=".5"/><circle cx="98" cy="92" r="16" fill="${a}"/>`;break;
    case 'vase':
      o+=`<rect x="${X}" y="${Y}" width="${W}" height="${H}" fill="${l}"/><rect x="${X}" y="232" width="${W}" height="44" fill="${s}" opacity=".55"/>`;
      [[112,106,s],[150,84,m],[188,110,s],[132,124,a],[170,128,a]].forEach(([x,y,col])=>{o+=`<path d="M150 186 Q${(150+x)/2} ${(186+y)/2} ${x} ${y}" stroke="#4F8A3A" stroke-width="3" fill="none"/>`+daisy(x,y,16,col,'#FFF3C4')});
      o+=`<path d="M126 252 Q112 214 134 196 L134 184 L166 184 L166 196 Q188 214 174 252Z" fill="${m}"/><path d="M122 220H178M120 234H180" stroke="${l}" stroke-width="5"/><rect x="128" y="180" width="44" height="8" rx="3" fill="${m}"/><path d="M128 214 Q124 232 132 248" stroke="#fff" stroke-width="3" opacity=".4" fill="none"/>`;break;
    case 'sea':
      o+=`<rect x="${X}" y="${Y}" width="${W}" height="150" fill="${l}"/><circle cx="196" cy="186" r="28" fill="${a}"/><rect x="${X}" y="186" width="${W}" height="${Y+H-186}" fill="${m}"/>`;
      for(let k=0;k<5;k++){let d=`M${X+8+(k%2)*18} ${200+k*15}`;for(let i=0;i<4;i++)d+=' q8 -5 16 0';o+=`<path d="${d}" stroke="${s}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`}
      o+=`<path d="M98 190 L142 190 L134 200 L106 200Z" fill="#7B5233"/><path d="M120 188 V140 L144 184Z" fill="#fff"/><path d="M118 188 V150 L100 184Z" fill="#fff" opacity=".85"/>`;break;
    case 'night':
      o+=`<rect x="${X}" y="${Y}" width="${W}" height="${H}" fill="${m}"/>`;
      for(let i=0;i<26;i++)o+=`<circle cx="${f(X+6+rng()*(W-12))}" cy="${f(Y+6+rng()*140)}" r="${f(.8+rng()*1.6)}" fill="${l}" opacity="${f(.5+rng()*.5)}"/>`;
      o+=`<circle cx="194" cy="86" r="22" fill="${s}"/><circle cx="204" cy="80" r="20" fill="${m}"/>`;
      o+=`<path d="M${X} 238 Q120 200 180 226 T${X+W} 214 V${Y+H} H${X}Z" fill="${s}" opacity=".75"/><path d="M${X} 254 Q140 232 ${X+W} 250 V${Y+H} H${X}Z" fill="${a}" opacity=".6"/>`;
      [[104,240,150],[162,236,170]].forEach(([x,by,ty])=>{const tx=x+10;o+=`<path d="M${x} ${by} Q${x+14} ${(by+ty)/2} ${tx} ${by-(by-ty)+40}" stroke="#141B38" stroke-width="5" fill="none"/>`;const cx=tx,cy=by-(by-ty)+40;for(let i=0;i<6;i++){const ang=-160+i*28;o+=`<path d="M${cx} ${cy} q${f(Math.cos(ang*Math.PI/180)*20)} ${f(Math.sin(ang*Math.PI/180)*20-8)} ${f(Math.cos(ang*Math.PI/180)*34)} ${f(Math.sin(ang*Math.PI/180)*34+6)}" stroke="#141B38" stroke-width="5" fill="none" stroke-linecap="round"/>`}});break;
    case 'abstract':
      o+=`<rect x="${X}" y="${Y}" width="${W}" height="${H}" fill="${l}"/>`;
      [[110,100,44,36,m],[188,150,40,52,s],[120,214,52,30,a],[196,236,26,22,m],[90,160,18,18,s]].forEach(([x,y,rx,ry,col])=>o+=`<path d="${blob(x,y,rx,ry,rng,9,.18)}" fill="${col}" opacity=".9"/>`);
      o+=`<path d="M80 70 q20 -14 40 0 t40 0 t40 0" stroke="${m}" stroke-width="3" fill="none" stroke-linecap="round"/>`;break;
  }
  return `<svg viewBox="0 0 300 390" xmlns="http://www.w3.org/2000/svg">${bgRect(u,'#F7F1E8',m)}
  <ellipse cx="150" cy="380" rx="100" ry="8" fill="#3a2a1a" opacity=".12"/>
  <path d="M150 22V382" stroke="#6E4A2C" stroke-width="8" stroke-linecap="round"/><path d="M110 262L70 382M190 262L230 382" stroke="#8C5E36" stroke-width="8" stroke-linecap="round"/>
  <rect x="${X+6}" y="${Y+8}" width="${W}" height="${H}" fill="#000" opacity=".12"/>
  <defs><clipPath id="cv${u}"><rect x="${X}" y="${Y}" width="${W}" height="${H}"/></clipPath></defs>
  <g clip-path="url(#cv${u})">${o}</g><rect x="${X}" y="${Y}" width="${W}" height="${H}" fill="none" stroke="#EFE8DA" stroke-width="5"/>
  <rect x="46" y="${Y+H}" width="208" height="13" rx="3" fill="#9C6A40"/><rect x="46" y="${Y+H}" width="208" height="4" rx="2" fill="#B98456"/></svg>`;
}
function strawberry(x,y,s,c){const [m,ss,a,l]=c;let o=`<path d="M${x} ${y+s} C${x-s*1.1} ${y+s*.1} ${x-s*.9} ${y-s*.7} ${x} ${y-s*.55} C${x+s*.9} ${y-s*.7} ${x+s*1.1} ${y+s*.1} ${x} ${y+s}Z" fill="${m}"/>`;for(let i=0;i<5;i++)o+=`<ellipse cx="${f(x+[-.4,.35,0,-.2,.25][i]*s)}" cy="${f(y+[-.1,0,.3,.55,.6][i]*s)}" rx="1.4" ry="2" fill="${l}"/>`;return o+`<path d="M${x-s*.6} ${y-s*.55} L${x} ${y-s*.3} L${x+s*.6} ${y-s*.55} L${x} ${y-s*.8}Z" fill="${a}"/>`}
function toteArt(it,P,rng,u){
  const [m,s,a,l]=P.c; let o='';
  switch(it.m){
    case 'daisy':for(let r=0;r<5;r++)for(let i=0;i<4;i++){const x=72+i*52+(r%2?26:0)+(rng()-.5)*8,y=172+r*44+(rng()-.5)*8;o+=daisy(x,y,15+rng()*4,'#fff',m,s)}break;
    case 'rainbow':o+=arches(150,330,[96,74,52,30],[m,a,s,'#F4EBDC'])+`<ellipse cx="80" cy="326" rx="26" ry="12" fill="#fff"/><ellipse cx="220" cy="326" rx="26" ry="12" fill="#fff"/><circle cx="210" cy="190" r="16" fill="${s}"/>`;break;
    case 'strawberry':for(let i=0;i<11;i++){const x=70+rng()*160,y=168+rng()*170;o+=`<g transform="rotate(${f((rng()-.5)*40)} ${f(x)} ${f(y)})">${strawberry(f(x),f(y),14+rng()*5,P.c)}</g>`}break;
    case 'stripes':for(let i=0;i<7;i++)o+=`<rect x="${44+i*32}" y="126" width="16" height="250" fill="${i%2?s:m}"/>`;break;
    case 'word':o+=`<use href="#sym-sun" x="122" y="172" width="56" height="56"/><text x="150" y="${it.word.length>4?300:296}" text-anchor="middle" font-family="Aref Ruqaa, serif" font-weight="700" font-size="${it.word.length>4?62:72}" fill="${m}">${it.word}</text><path d="M86 322 q16 -10 32 0 t32 0 t32 0 t32 0" stroke="${s}" stroke-width="5" fill="none" stroke-linecap="round"/>`;break;
    case 'sun':for(let i=0;i<12;i++)o+=`<path d="M-7 -44 C-12 -64 6 -70 0 -92 C14 -70 4 -60 7 -44Z" fill="${m}" transform="translate(150 250) rotate(${i*30})"/>`;o+=`<circle cx="150" cy="250" r="40" fill="${s}"/><path d="M136 244q5 5 10 0M154 244q5 5 10 0M140 260q10 9 20 0" stroke="${m}" stroke-width="3" fill="none" stroke-linecap="round"/>`;break;
  }
  const bag='M48 126 L252 126 L260 360 Q260 372 248 372 L52 372 Q40 372 40 360 Z';
  return `<svg viewBox="0 0 300 390" xmlns="http://www.w3.org/2000/svg">${bgRect(u,l,m)}
  <ellipse cx="150" cy="378" rx="112" ry="8" fill="#3a2a1a" opacity=".12"/>
  <path d="M92 132 C92 26 208 26 208 132" stroke="#D3C4AA" stroke-width="14" fill="none"/><path d="M104 132 C104 46 196 46 196 132" stroke="#E6D9C2" stroke-width="13" fill="none"/>
  <defs><clipPath id="tb${u}"><path d="${bag}"/></clipPath></defs>
  <path d="${bag}" fill="#F4EBDC"/><g clip-path="url(#tb${u})">${o}<rect x="30" y="120" width="240" height="260" fill="url(#foldG)"/><rect x="30" y="120" width="240" height="22" fill="#E9DDC8"/></g>
  <path d="M46 142 H254" stroke="#D6C6AA" stroke-width="1.5" stroke-dasharray="5 4"/><path d="${bag}" fill="none" stroke="#DCCDB2" stroke-width="2"/></svg>`;
}
function stoneArt(it,P,rng,u){
  const [m,s,a,l]=P.c; const main=blob(140,140,100,74,rng,11,.06), s1=blob(286,168,38,30,rng,9,.08), s2=blob(276,86,28,22,rng,9,.1);
  let base=m, o='';
  switch(it.m){
    case 'ladybug':base=m;o+=`<circle cx="52" cy="140" r="44" fill="#2B2730"/><path d="M92 140 H246" stroke="#2B2730" stroke-width="4"/>`;[[130,104,13],[176,108,11],[214,124,9],[134,176,12],[180,174,11],[218,156,8]].forEach(([x,y,r])=>o+=`<circle cx="${x}" cy="${y}" r="${r}" fill="#2B2730"/>`);o+=`<circle cx="66" cy="124" r="7" fill="#fff"/><circle cx="66" cy="156" r="7" fill="#fff"/><circle cx="64" cy="124" r="3" fill="#2B2730"/><circle cx="64" cy="156" r="3" fill="#2B2730"/>`;break;
    case 'mandala':base='#474B57';for(let k=0;k<5;k++){const r=12+k*13,n=6+k*6;for(let i=0;i<n;i++){const [x,y]=polar(140,140,r,i*360/n);o+=`<ellipse cx="${x}" cy="${f(140+(y-140)*.82)}" rx="${f(5.2-k*.6)}" ry="${f(4.6-k*.55)}" fill="${[m,s,a,l][k%4]}"/>`}}o+=`<circle cx="140" cy="140" r="7" fill="${s}"/>`;break;
    case 'cactus':base='#EADCC4';o+=`<rect x="128" y="76" width="26" height="64" rx="13" fill="${s}"/><rect x="104" y="96" width="16" height="30" rx="8" fill="${s}"/><rect x="112" y="116" width="20" height="10" rx="4" fill="${s}"/><rect x="160" y="88" width="16" height="30" rx="8" fill="${s}"/><rect x="150" y="108" width="18" height="10" rx="4" fill="${s}"/><path d="M134 90l3-3M146 104l3-3M136 122l3-3" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/><path d="M114 140 H168 L162 176 H120Z" fill="${m}"/><rect x="110" y="136" width="62" height="10" rx="3" fill="${a}"/>`+daisy(141,74,9,'#F2A3B8','#FFE08A');break;
    case 'heart':base=m;o+=`<path d="${heartPath(140,148,52)}" fill="${l}"/>`;[[70,110,14],[214,112,12],[206,182,16],[80,184,11],[150,80,9]].forEach(([x,y,sz])=>o+=`<path d="${heartPath(x,y,sz)}" fill="${s}"/>`);break;
    case 'fish':base=a;o+=`<g transform="translate(140 140)"><path d="M48 0 L80 -24 L74 0 L80 24Z" fill="${s}"/><ellipse rx="58" ry="34" fill="${m}"/>`;for(let r=0;r<2;r++)for(let i=0;i<3;i++)o+=`<path d="M${-8+i*16} ${-14+r*18} a8 8 0 0 0 0 14" stroke="${s}" stroke-width="2.5" fill="none"/>`;o+=`<circle cx="-34" cy="-6" r="7" fill="#fff"/><circle cx="-35" cy="-6" r="3.5" fill="#1d2433"/></g>`;[[62,80,6],[48,64,4],[230,92,5]].forEach(([x,y,r])=>o+=`<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${l}" stroke-width="2"/>`);break;
    case 'moon':base=m;o+=`<circle cx="120" cy="136" r="44" fill="${s}"/><circle cx="140" cy="122" r="40" fill="${m}"/>`;for(let i=0;i<14;i++)o+=`<circle cx="${f(70+rng()*160)}" cy="${f(86+rng()*110)}" r="${f(1.2+rng()*2.4)}" fill="${l}"/>`;o+=`<path d="M200 96 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z" fill="${s}"/>`;break;
  }
  const small=(d,cx,cy,col,dot)=>{let r=`<path d="${d}" fill="${col}"/>`;for(let i=0;i<5;i++)r+=`<circle cx="${f(cx-14+i*7)}" cy="${f(cy+(i%2?4:-4))}" r="2.6" fill="${dot}"/>`;return r+`<path d="${d}" fill="url(#stoneSh)"/>`};
  let sand='';for(let i=0;i<40;i++)sand+=`<circle cx="${f(rng()*340)}" cy="${f(rng()*260)}" r="${f(.6+rng()*1.2)}" fill="${m}" opacity=".12"/>`;
  return `<svg viewBox="0 0 340 260" xmlns="http://www.w3.org/2000/svg">${bgRect(u,l,m)}${sand}
  <ellipse cx="146" cy="214" rx="100" ry="14" fill="#3a2a1a" opacity=".14"/><ellipse cx="288" cy="198" rx="40" ry="7" fill="#3a2a1a" opacity=".12"/><ellipse cx="278" cy="108" rx="28" ry="5" fill="#3a2a1a" opacity=".1"/>
  ${small(s1,286,168,s,l)}${small(s2,276,86,a,l)}
  <defs><clipPath id="st${u}"><path d="${main}"/></clipPath></defs>
  <path d="${main}" fill="${base}"/><g clip-path="url(#st${u})">${o}</g><path d="${main}" fill="url(#stoneSh)"/></svg>`;
}
function mugArt(it,P,rng,u){
  const [m,s,a,l]=P.c, body='M80 96 L220 96 L216 236 Q214 266 184 266 L116 266 Q86 266 84 236 Z';
  let bg=l, o='';
  switch(it.m){
    case 'lemons':
      for(let i=0;i<7;i++){const x=96+(i%4)*38+(i>3?19:0)+(rng()-.5)*8,y=128+(i>3?70:0)+(rng()-.5)*14,r=(rng()-.5)*60;
        o+=`<g transform="translate(${f(x)} ${f(y)}) rotate(${f(r)})"><ellipse rx="15" ry="11" fill="${m}"/><ellipse cx="15" rx="3" ry="2.5" fill="${m}"/><ellipse cx="-4" cy="-4" rx="5" ry="2.4" fill="#fff" opacity=".5"/><ellipse cx="-6" cy="-13" rx="4" ry="8" fill="${s}" transform="rotate(-50 -6 -13)"/></g>`}
      o+=`<path d="M84 238 H216" stroke="${s}" stroke-width="5" stroke-dasharray="2 9" stroke-linecap="round"/>`;break;
    case 'dots':bg=m;for(let r=0;r<8;r++)for(let i=0;i<9;i++)o+=`<circle cx="${84+i*17+(r%2?8:0)}" cy="${110+r*20}" r="5" fill="${r%2?l:s}"/>`;break;
    case 'stripes':[m,l,s,l,a,l,m,l,s].forEach((col,k)=>o+=`<rect x="70" y="${96+k*19}" width="160" height="19" fill="${col}"/>`);break;
    case 'daisy':bg=m;for(let r=0;r<4;r++)for(let i=0;i<4;i++)o+=daisy(98+i*36+(r%2?18:0)+(rng()-.5)*6,124+r*40+(rng()-.5)*6,14,'#fff',s);break;
    case 'strawberry':bg='#FFF6F2';for(let i=0;i<9;i++){const x=96+rng()*108,y=118+rng()*120;o+=`<g transform="rotate(${f((rng()-.5)*40)} ${f(x)} ${f(y)})">${strawberry(f(x),f(y),11+rng()*4,P.c)}</g>`}break;
    case 'word':o+=`<text x="150" y="196" text-anchor="middle" font-family="Aref Ruqaa, serif" font-weight="700" font-size="52" fill="${m}">${it.word}</text><path d="M108 216 q10 -7 21 0 t21 0 t21 0 t21 0" stroke="${s}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
      [[112,134,8],[188,128,6],[200,152,4]].forEach(([x,y,sz])=>o+=`<path d="${heartPath(x,y,sz)}" fill="${a}"/>`);break;
    case 'waves':bg=m;for(let k=0;k<6;k++){let d=`M70 ${120+k*26}`;for(let i=0;i<9;i++)d+=' q9 -10 18 0';o+=`<path d="${d}" stroke="${k%2?s:l}" stroke-width="5" fill="none" stroke-linecap="round" opacity="${k%2?1:.8}"/>`}break;
    case 'hearts':for(let i=0;i<11;i++){const x=96+rng()*108,y=116+rng()*126;o+=`<path d="${heartPath(x,y,8+rng()*8)}" fill="${i%3?m:s}"/>`}break;
  }
  return `<svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">${bgRect(u,l,m)}
  <ellipse cx="152" cy="272" rx="92" ry="10" fill="#3a2a1a" opacity=".13"/>
  <path d="M214 126 C276 120 282 222 210 220" fill="none" stroke="#E4DDD1" stroke-width="24" stroke-linecap="round"/>
  <path d="M214 126 C276 120 282 222 210 220" fill="none" stroke="#FCFAF6" stroke-width="15" stroke-linecap="round"/>
  <defs><clipPath id="mg${u}"><path d="${body}"/></clipPath></defs>
  <g clip-path="url(#mg${u})"><rect x="60" y="80" width="180" height="200" fill="${bg}"/>${o}<rect x="60" y="80" width="180" height="200" fill="url(#shadeX)"/></g>
  <path d="${body}" fill="none" stroke="rgba(0,0,0,.07)" stroke-width="2"/>
  <ellipse cx="150" cy="96" rx="70" ry="12" fill="#F4EFE7" stroke="#E4DDD1" stroke-width="2"/>
  <ellipse cx="150" cy="98" rx="61" ry="8" fill="#7A4E35"/><ellipse cx="136" cy="96" rx="18" ry="2.6" fill="#fff" opacity=".25"/></svg>`;
}
function artSVG(it){
  if(it.img) return `<img src="${it.img}" alt="${it.t}" loading="lazy">`;
  const u=++UID, P=PAL[it.p], rng=rngFor(it.id), k=CATS.find(c=>c.id===it.cat).kind;
  return ({mug:mugArt,pot:potArt,plate:plateArt,canvas:canvasArt,tote:toteArt,stones:stoneArt})[k](it,P,rng,u);
}


/* =======================================================
   2b) الشعار + الشمس في الأيقونات + الفوتر
   ======================================================= */
(() => {
  const $ = id => document.getElementById(id);
  /* شمس الأيقونات (العنوان، الصناديق...) تصير صورة شمسكم */
  if (SCENE.sun) { const t = new Image(); t.onload = () => { const sym = $('sym-sun'); sym.setAttribute('viewBox','-32 -32 64 64'); sym.innerHTML = `<image href="${SCENE.sun}" x="-32" y="-32" width="64" height="64" preserveAspectRatio="xMidYMid meet"/>`; }; t.src = SCENE.sun; }
  /* حسابات التواصل */
  const go = '<svg class="go" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>';
  const ic = {
    camera: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M4 8h3l1.6-2.4h6.8L17 8h3v11H4z"/><circle cx="12" cy="13.2" r="3.4"/></svg>',
    note: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 17V5l9-2v12"/><circle cx="7.5" cy="17" r="2.5"/><circle cx="16.5" cy="15" r="2.5"/></svg>',
    bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg>'
  };
  const items = [];
  if (LINKS.instagram) items.push(`<a class="social" href="https://www.instagram.com/${LINKS.instagram}/" target="_blank" rel="noopener"><span class="ic">${ic.camera}</span><span class="tx"><b>انستقرام</b><small dir="ltr">@${LINKS.instagram}</small></span>${go}</a>`);
  if (LINKS.tiktok) items.push(`<a class="social" href="https://www.tiktok.com/@${LINKS.tiktok}" target="_blank" rel="noopener"><span class="ic">${ic.note}</span><span class="tx"><b>تيك توك</b><small dir="ltr">@${LINKS.tiktok}</small></span>${go}</a>`);
  items.push(LINKS.store
    ? `<a class="social" href="${LINKS.store}" target="_blank" rel="noopener"><span class="ic">${ic.bag}</span><span class="tx"><b>متجرنا</b><small>اطلب صندوقك من هنا</small></span>${go}</a>`
    : `<div class="social soon"><span class="ic">${ic.bag}</span><span class="tx"><b>متجرنا</b><small>نجهّزه لكم</small></span><span class="badge">قريبًا</span></div>`);
  $('socials').innerHTML = items.join('');
})();

/* =======================================================
   3) HERO SCENE — المشهد المتحرك (نفس النسخة السابقة)
   ======================================================= */
(() => {
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = id => document.getElementById(id);
  const hero=$('top'), stage=$('stage'), nav=$('nav');
  const sunEl=$('sun'), titleEl=$('title'), hillsEl=$('hills'), hazeEl=$('haze'), veil=$('veil'), cue=$('cue'), streaks=$('streaks');
  const cc=$('clouds'), cx=cc.getContext('2d'), mc=$('meadow'), mx=mc.getContext('2d'), mbc=$('meadowBack'), mb=mbc.getContext('2d');
  const rnd=(a,b)=>a+Math.random()*(b-a), pick=a=>a[(Math.random()*a.length)|0], lerp=(a,b,t)=>a+(b-a)*t;
  const smooth=(a,b,x)=>{x=Math.min(1,Math.max(0,(x-a)/(b-a)));return x*x*(3-2*x)};
  const NS='http://www.w3.org/2000/svg';
  function el(tag,attrs){const e=document.createElementNS(NS,tag);for(const k in attrs)e.setAttribute(k,attrs[k]);return e}
  function ray(L,w,rot,fill,stroke){return el('path',{d:`M${-w},-50 C${-w*2.2},-${50+L*.35} ${w*1.3},-${50+L*.55} 0,-${50+L} C${w*2.4},-${50+L*.58} ${-w*.2},-${50+L*.32} ${w},-50 Z`,transform:`rotate(${rot})`,fill,stroke,'stroke-width':1.6,'stroke-linejoin':'round'})}
  const rA=$('raysA'), rB=$('raysB');
  for(let i=0;i<14;i++)rA.insertBefore(ray(i%2?62:92,11,i*360/14,'url(#rayG)','#E99A1D'),rA.firstChild);
  for(let i=0;i<14;i++)rB.insertBefore(ray(46,9,i*360/14+360/28,'#FFE58A','#F2B63A'),rB.firstChild);

  let W=0,H=0,DPR=1,clouds=[],motes=[],bands=[],offB=0,offF=0;
  const st={p:0,t:0};

  /* ---------- صورة الشمس ---------- */
  const sunTwin=$('sunTwin'),lettersEl=$('logoLetters');sunTwin.innerHTML=sunEl.innerHTML;
  if(SCENE.sun){const im=new Image();im.onload=()=>{sunTwin._still=undefined;sunEl.innerHTML=sunTwin.innerHTML=`<div class="sun-halo"></div><img class="sun-img${SCENE.sunSpin?' spin':''}" src="${SCENE.sun}" alt="">`};im.src=SCENE.sun}

  /* ---------- صور الغيوم: تنعيم الأطراف ---------- */
  function feather(im){
    const c=document.createElement('canvas'),w=c.width=im.naturalWidth,h=c.height=im.naturalHeight,g=c.getContext('2d');
    g.drawImage(im,0,0);g.globalCompositeOperation='destination-out';
    const fade=(x0,y0,x1,y1)=>{const gr=g.createLinearGradient(x0,y0,x1,y1);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(0,0,0,1)');return gr};
    g.fillStyle=fade(0,h*.5,0,h*.97);g.fillRect(0,h*.5,w,h*.5);
    g.fillStyle=fade(w*.07,0,0,0);g.fillRect(0,0,w*.07,h);
    g.fillStyle=fade(w*.93,0,w,0);g.fillRect(w*.93,0,w*.07,h);
    g.fillStyle=fade(0,h*.08,0,0);g.fillRect(0,0,w,h*.08);
    return {img:c,ratio:h/w};
  }
  const userClouds=[];let ucT;
  (SCENE.clouds||[]).forEach(src=>{const im=new Image();im.onload=()=>{userClouds.push(feather(im));clearTimeout(ucT);ucT=setTimeout(()=>{if(W){buildClouds();if(RM)drawClouds(0,st.p)}},80)};im.src=src});
  function userCloud(w){const u=pick(userClouds),ww=w*1.7;return {img:u.img,w:ww,h:ww*u.ratio}}

  /* ---------- صور النباتات ---------- */
  /* يحدد مكان أسفل الساق في الصورة عشان النبتة تتمايل منه */
  function stemBase(im){try{const w=im.naturalWidth,h=im.naturalHeight,c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.drawImage(im,0,0);
    let maxY=0;const d=g.getImageData(0,0,w,h).data;for(let y=h-1;y>=0&&!maxY;y--)for(let x=0;x<w;x++)if(d[(y*w+x)*4+3]>40){maxY=y;break}
    let sx=0,n=0;for(let y=Math.max(0,maxY-Math.round(h*.04));y<=maxY;y++)for(let x=0;x<w;x++)if(d[(y*w+x)*4+3]>60){sx+=x;n++}
    return n?sx/n/w:.5}catch(e){return .5}}
  /* رقم ثابت = نفس ترتيب المرج في كل مرة */
  let seedRand=Math.random;
  const seeded=n=>()=>{n|=0;n=n+0x6D2B79F5|0;let t=Math.imul(n^n>>>15,1|n);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
  const plants=[];let upT;
  const wpick=a=>{let t=0;for(const x of a)t+=x.weight;let r=seedRand()*t;for(const x of a){r-=x.weight;if(r<=0)return x}return a[a.length-1]};
  {const list=SCENE.flowers||[];let pending=list.length;
   const done=()=>{if(--pending)return;plants.sort((a,b)=>a.order-b.order);if(W){buildMeadow();if(RM)drawMeadow(0)}};
   list.forEach((f,order)=>{const src=typeof f==='string'?f:f.src,size=(typeof f==='object'&&f.size)||1,weight=(typeof f==='object'&&f.weight)||1,im=new Image();
    im.onload=()=>{plants.push({img:im,size,weight,order,ratio:im.naturalWidth/im.naturalHeight,bx:stemBase(im)});done()};im.onerror=done;im.src=src});}

  function resize(){W=stage.clientWidth;H=stage.clientHeight;DPR=Math.min(window.devicePixelRatio||1,W<700?1.5:2,dprCap);for(const c of [cc,mc,mbc]){c.width=Math.round(W*DPR);c.height=Math.round(H*DPR)}heroBottom=hero.offsetTop+hero.offsetHeight;logoGeom();buildClouds();buildMeadow();measure();if(RM){drawClouds(0,st.p);drawMeadow(0)}}
  function makeCloud(w,o){
    const H0=w*.62,h=w*.9,off=h-H0,s=DPR,c=document.createElement('canvas');c.width=Math.ceil(w*s);c.height=Math.ceil(h*s);const g=c.getContext('2d');g.scale(s,s);
    const n=5+((Math.random()*4)|0),puffs=[];
    for(let i=0;i<n;i++){const t=i/(n-1),bell=Math.sin(Math.PI*t);const r=w*(.085+.12*bell)*rnd(.85,1.15);puffs.push({x:w*(.14+.72*t)+rnd(-.02,.02)*w,y:off+H0*.74-r*(.5+bell*.45),r})}
    for(let i=0;i<2;i++){const p=puffs[1+((Math.random()*(n-2))|0)];puffs.push({x:p.x+rnd(-.06,.06)*w,y:p.y-p.r*.45,r:p.r*.72})}
    const baseY=off+H0*.78;g.fillStyle=o.shade;puffs.forEach(p=>{g.beginPath();g.arc(p.x,p.y+p.r*.2,p.r,0,7);g.fill()});
    g.beginPath();g.ellipse(w/2,baseY-H0*.06,w*.4,H0*.1,0,0,7);g.fill();
    puffs.forEach(p=>{const gr=g.createRadialGradient(p.x-p.r*.3,p.y-p.r*.45,p.r*.1,p.x,p.y,p.r);gr.addColorStop(0,'#FFFFFF');gr.addColorStop(.6,'#FCFAFF');gr.addColorStop(1,o.mid);g.fillStyle=gr;g.beginPath();g.arc(p.x,p.y-p.r*.06,p.r*.94,0,7);g.fill()});
    g.globalCompositeOperation='source-atop';const tg=g.createLinearGradient(0,off+H0*.35,0,baseY);tg.addColorStop(0,'rgba(255,255,255,0)');tg.addColorStop(1,o.tint);g.fillStyle=tg;g.fillRect(0,0,w,h);
    g.globalCompositeOperation='source-over';g.strokeStyle='rgba(255,255,255,.95)';g.lineWidth=Math.max(1.2,w/220);g.lineCap='round';
    puffs.forEach(p=>{g.beginPath();g.arc(p.x,p.y-p.r*.06,p.r*.8,Math.PI*1.15,Math.PI*1.6);g.stroke()});
    g.globalCompositeOperation='destination-out';const fg=g.createLinearGradient(0,baseY-H0*.1,0,baseY+H0*.06);fg.addColorStop(0,'rgba(0,0,0,0)');fg.addColorStop(1,'rgba(0,0,0,1)');g.fillStyle=fg;g.fillRect(0,baseY-H0*.1,w,h);g.globalCompositeOperation='source-over';
    return {img:c,w,h};
  }
  let firstBuild=true;
  function buildClouds(){
    clouds=[];const k=Math.min(1.25,Math.max(.6,W/1300)),area=W/1200,few=userClouds.length?.5:1;
    [{n:Math.round((5+3*area)*few),d:[.12,.25],w:[170,300],y:[.5,.62],o:{shade:'#E7B9CE',mid:'#F8DFE8',tint:'rgba(238,150,184,.55)'},a:.92},
     {n:Math.round((6+5*area)*few),d:[.28,.46],w:[110,200],y:[.04,.46],o:{shade:'#D8D0EE',mid:'#EEEAF8',tint:'rgba(246,190,212,.4)'},a:.85},
     {n:Math.round((3+3*area)*few),d:[.52,.76],w:[210,340],y:[0,.5],o:{shade:'#D2C7EA',mid:'#F1ECF9',tint:'rgba(244,184,206,.48)'},a:.96},
     {n:Math.round((2+2*area)*few),d:[.82,1],w:[360,560],y:[-.06,.42],o:{shade:'#CEC2E8',mid:'#F4F0FB',tint:'rgba(242,178,202,.5)'},a:1}
    ].forEach(s=>{for(let i=0;i<s.n;i++){const d=rnd(...s.d),w=rnd(...s.w)*k,c=userClouds.length?userCloud(w):makeCloud(w,s.o);clouds.push({...c,d,x:rnd(-w,W),y:rnd(...s.y)*H-c.h*.5,v:(3+d*15)*rnd(.8,1.2),a:s.a})}});
    /* أول ما يفتح الموقع: الشمس مكشوفة وفيه غيوم قليلة، والباقي يدخل من اليسار مع الوقت */
    if(firstBuild){
      const S=Math.min(W*.34,H*.30,300),scx=W/2,scy=H*.05+S/2,R=S*.62;
      clouds.forEach((c,i)=>{
        const hitsSun=c.x<scx+R&&c.x+c.w>scx-R&&c.y<scy+R&&c.y+c.h>scy-R;
        if(hitsSun||i%5<2)c.x=-c.w-rnd(20,W*.7);
      });
      firstBuild=false;
    }
    clouds.sort((a,b)=>a.d-b.d);
  }
  function drawClouds(dt,p){
    cx.setTransform(DPR,0,0,DPR,0,0);cx.clearRect(0,0,W,H);const pp=Math.pow(p,1.35);
    for(const c of clouds){c.x+=c.v*dt;if(c.x>W+20)c.x=-c.w-20;const mid=c.x+c.w/2,side=mid<W/2?-1:1,sc=1+pp*.55*c.d,dx=side*pp*W*.6*(.4+c.d),dy=pp*H*.14*c.d,w=c.w*sc,h=c.h*sc;cx.globalAlpha=c.a*(1-pp*.25);cx.drawImage(c.img,mid-w/2+dx,c.y+c.h/2-h/2+dy,w,h)}
    cx.globalAlpha=1;
  }

  /* ---------- المرج ---------- */
  function horizonFn(){
    const hp=hillsEl.querySelector('path'),top=hillsEl.offsetTop,hh=hillsEl.offsetHeight,N=96,ys=new Array(N+1).fill(Infinity);
    try{const L=hp.getTotalLength();for(let i=0;i<=800;i++){const q=hp.getPointAtLength(L*i/800);if(q.y<480){const k=Math.round(q.x/1440*N);if(k>=0&&k<=N)ys[k]=Math.min(ys[k],q.y)}}}catch(e){}
    for(let k=0;k<=N;k++)if(!isFinite(ys[k]))ys[k]=k?ys[k-1]:150;
    const f=x=>{const u=Math.min(N,Math.max(0,x/W*N)),k=Math.floor(u),fr=u-k,a=ys[k],b=ys[Math.min(N,k+1)];return top+(a+(b-a)*fr)/500*hh};
    f.min=top+Math.min(...ys)/500*hh;return f;
  }
  /* درجات العشب: [لون الجذر، لون الطرف] من البعيد للقريب */
  const TONES=[
    [['#8FBA74','#C9E0A8'],['#9CC37E','#D4E8B4'],['#86B26B','#BFDA9C']],
    [['#5E9A3E','#A9D27A'],['#6BA548','#B9DB88'],['#548E37','#9CC86B']],
    [['#3E7D2C','#8EC25A'],['#4A8A33','#A0CC68'],['#356F26','#7FB44E']],
    [['#2C6122','#76AC48'],['#37702A','#88BA55'],['#26561D','#679C3D']]
  ];
  function buildMeadow(){
    seedRand=seeded(SCENE.meadowSeed||1);const rnd=(a,b)=>a+seedRand()*(b-a),pick=a=>a[(seedRand()*a.length)|0];
    bands=[];motes=[];
    /* العشب البعيد ما يبان تمايله: نرسمه مرة وحدة كصورة ثابتة ونوفّر الجهد */
    farC=farC||document.createElement('canvas');farC.width=Math.round(W*DPR);farC.height=Math.round(H*DPR);const fg=farC.getContext('2d');
    const mob=W<700?.75:1,hz=horizonFn(),frontLine=H*.93,NB=W<700?12:16,Yb=H*1.03,dens=SCENE.flowerDensity||1,pscale=SCENE.flowerScale||1;
    hazeEl.style.top=(hz.min-H*.03)+'px';hazeEl.style.height=(H*.13)+'px';
    for(let i=0;i<NB;i++){
      const u=i/(NB-1),sc=.16+.84*Math.pow(u,1.15),tones=TONES[u<.3?0:u<.62?1:u<.86?2:3];
      const yAt=(x,j)=>{const h0=hz(x)+3;return h0+(Yb-h0)*Math.pow(Math.min(1,Math.max(0,u+j)),1.35)};
      const mk=()=>({groups:tones.map(t=>({t,bl:[],y0:1e9,y1:-1e9})),stalks:[],plants:[]});
      const band={bk:mk(),fr:mk(),far:u<.45};
      /* شفرات العشب */
      const n=Math.round(W/(2+1.7*u));
      for(let k=0;k<n;k++){const x=rnd(-10,W+10),by=yAt(x,rnd(-.025,.02)),bk=by>frontLine?band.fr:band.bk,g=pick(bk.groups);
        const b={x,by,h:rnd(.04,.13)*H*sc*mob*(u>.95?1.2:1),w:rnd(1.1,2.6)*(.3+.9*sc),f:rnd(1.1,2.3),ph:rnd(0,6.28),flex:rnd(.7,1.25),lean:rnd(-.18,.18),fore:seedRand()<.3,q:Math.random()};
        g.bl.push(b);g.y0=Math.min(g.y0,by-b.h);g.y1=Math.max(g.y1,by)}
      /* تدرّجات الألوان لكل مجموعة */
      for(const [bk,g] of [[band.bk,band.far?fg:mb],[band.fr,mx]])for(const gr of bk.groups){if(!gr.bl.length)continue;const lg=g.createLinearGradient(0,gr.y1,0,gr.y0+(gr.y1-gr.y0)*.15);lg.addColorStop(0,gr.t[0]);lg.addColorStop(1,gr.t[1]);gr.fill=lg}
      /* نباتات: تجمعات صغيرة من نفس النوع */
      if(plants.length){
        if(u<.12){bands.push(band);continue}
        const clusters=Math.max(1,Math.round(W/lerp(230,520,u)*dens));
        for(let c=0;c<clusters;c++){
          const sp=wpick(plants),cxp=rnd(0,W),m=1+((seedRand()*(u<.5?4:3))|0),spread=lerp(18,110,u)*mob;
          for(let q=0;q<m;q++){const x=cxp+rnd(-1,1)*spread,by=yAt(x,rnd(-.012,.018));
            let h=H*lerp(.035,.34,Math.pow(u,1.5))*rnd(.7,1.15)*sp.size*pscale*mob;
            if(u>.85){const z=(x-W/2)/(W*.22);h*=1-.35*Math.exp(-z*z)}
            (by>frontLine?band.fr:band.bk).plants.push({img:sp.img,bx:sp.bx,x,by,h,w:h*sp.ratio,flip:seedRand()<.5,f:rnd(.7,1.3),ph:rnd(0,6.28),flex:rnd(.7,1.2),tilt:rnd(-.06,.06)})}
        }
        band.bk.plants.sort((a,b)=>a.by-b.by);band.fr.plants.sort((a,b)=>a.by-b.by);
      }
      bands.push(band);
    }
    fg.setTransform(DPR,0,0,DPR,0,0);fg.clearRect(0,0,W,H);for(const band of bands)if(band.far)drawBucket(fg,band.bk,0,0);
    const mn=Math.round(18+W/70);for(let i=0;i<mn;i++)motes.push({x:rnd(0,W),y:rnd(H*.3,H),r:rnd(.8,2.2),vy:rnd(6,16),ph:rnd(0,6.28),a:rnd(.35,.85)});
  }
  const sway=(o,wind,t)=>(wind*.34+Math.sin(t*o.f+o.ph+o.x*.004)*.07)*o.flex;
  function blades(g,bk,wind,t,fore){
    for(const gr of bk.groups){if(!gr.bl.length)continue;g.fillStyle=gr.fill;g.beginPath();
      for(const b of gr.bl){if(b.fore!==fore||b.q>quality)continue;const bend=(sway(b,wind,t)+b.lean)*b.h,tipY=b.by-Math.sqrt(Math.max(b.h*b.h-bend*bend*.6,b.h*b.h*.35));
        g.moveTo(b.x-b.w,b.by);g.quadraticCurveTo(b.x-b.w*.25+bend*.4,(b.by+tipY)/2,b.x+bend,tipY);g.quadraticCurveTo(b.x+b.w*.25+bend*.4,(b.by+tipY)/2,b.x+b.w,b.by);g.closePath()}
      g.fill()}
  }
  function drawBucket(g,bk,wind,t){
    blades(g,bk,wind,t,false);
    for(const s of bk.stalks){const bend=(sway(s,wind,t)*1.2+s.lean)*s.h,tipY=s.by-Math.sqrt(Math.max(s.h*s.h-bend*bend*.6,s.h*s.h*.35)),tx=s.x+bend;
      g.strokeStyle=s.col;g.lineWidth=Math.max(.6,s.r*.35);g.beginPath();g.moveTo(s.x,s.by);g.quadraticCurveTo(s.x+bend*.3,(s.by+tipY)/2,tx,tipY);g.stroke();
      const ang=Math.atan2(bend,s.h);g.save();g.translate(tx,tipY);g.rotate(ang);g.fillStyle=s.col;
      for(let k=0;k<5;k++){g.beginPath();g.ellipse((k%2?1:-1)*s.r*.55,k*s.r*1.1,s.r*.55,s.r*1.15,(k%2?.5:-.5),0,7);g.fill()}
      g.restore()}
    for(const p of bk.plants){
      g.fillStyle='rgba(30,60,20,.16)';g.beginPath();g.ellipse(p.x,p.by,p.w*.32,Math.max(2,p.h*.025),0,0,7);g.fill();
      const a=sway(p,wind,t)*.16+p.tilt;g.save();g.translate(p.x,p.by);g.rotate(a);if(p.flip)g.scale(-1,1);g.drawImage(p.img,-p.w*p.bx,-p.h,p.w,p.h);g.restore()}
    blades(g,bk,wind,t,true);
  }
  function drawMeadow(dt){
    const t=time,wind=Math.sin(t*.55)*.5+Math.sin(t*1.27+1.3)*.22+Math.sin(t*.19)*.3;
    mb.setTransform(DPR,0,0,DPR,0,0);mb.clearRect(0,0,W,H);mx.setTransform(DPR,0,0,DPR,0,0);mx.clearRect(0,0,W,H);
    mb.drawImage(farC,0,0,W,H);
    for(const band of bands){if(!band.far)drawBucket(mb,band.bk,wind,t);drawBucket(mx,band.fr,wind,t)}
    for(const m of motes){m.y-=m.vy*dt;m.x+=(wind*14+Math.sin(t+m.ph)*6)*dt;if(m.y<H*.2){m.y=H+5;m.x=rnd(0,W)}if(m.x>W+5)m.x=-5;if(m.x<-5)m.x=W+5;
      const fade=smooth(H*.2,H*.45,m.y)*m.a*(.6+.4*Math.sin(t*2+m.ph));mx.fillStyle=`rgba(255,246,214,${fade*.22})`;mx.beginPath();mx.arc(m.x,m.y,m.r*3.2,0,7);mx.fill();mx.fillStyle=`rgba(255,252,236,${fade})`;mx.beginPath();mx.arc(m.x,m.y,m.r,0,7);mx.fill()}
  }

  /* ---------- التمرير ---------- */
  /* مكان الشعار النهائي في وسط الشاشة */
  const G={};
  const SUN_Y=.72;   // مكان مركز الشمس عموديًا على الحروف (0 = أعلاها، 1 = أسفلها)
  function logoGeom(){
    const S=sunEl.offsetWidth||300,Lw=Math.min(W*.72,540),Lh=Lw*100/364;
    G.S=S;G.sx=W/2;G.sy=sunEl.offsetTop+S/2;
    G.fx=W/2-Lw/2+Lw*.722;G.fy=H*.47;
    G.Sf=Lw*.414/.89*(SCENE.logoSunSize||1);
    lettersEl.style.width=Lw+'px';lettersEl.style.left=(W/2-Lw/2)+'px';lettersEl.style.top=(G.fy-Lh*SUN_Y)+'px';
  }
  function measure(){const range=hero.offsetHeight-stage.offsetHeight;st.t=range>0?Math.min(1,Math.max(0,(window.scrollY-hero.offsetTop)/range)):0;nav.classList.toggle('solid',window.scrollY>hero.offsetTop+range+H*.35)}
  function apply(p){const vh=H/100,e=p*p*(3-2*p);
    /* الشمس تنزل بنعومة لين تستقر في مكانها من الشعار */
    const m=smooth(.1,.74,p),mm=m*m*(3-2*m),k=1+(G.Sf/G.S-1)*mm;
    const arc=Math.sin(mm*Math.PI)*H*.05;   // انحناءة خفيفة في المسار بدل خط مستقيم
    const tr=`translate3d(-50%,0,0) translate(${(G.fx-G.sx)*mm}px,${(G.fy-G.sy)*mm+arc}px) scale(${k})`;
    sunEl.style.transform=sunTwin.style.transform=tr;
    const x=smooth(.2,.44,p);sunEl.style.opacity=1-x;sunTwin.style.opacity=x;
    /* لما توصل الشمس للشعار: يختفي توهّجها وتوقف عن الدوران */
    const calm=smooth(.6,.74,p),still=p>=.72;
    sunTwin.querySelectorAll('.sun-halo').forEach(h=>h.style.filter=`opacity(${(1-calm).toFixed(3)})`);
    sunTwin.querySelectorAll('circle.glow').forEach(c=>c.style.fillOpacity=(1-calm).toFixed(3));
    if(still!==sunTwin._still){sunTwin._still=still;
      sunTwin.querySelectorAll('.sun-img').forEach(i=>i.style.animationPlayState=still?'paused':'running');
      sunTwin.querySelectorAll('svg').forEach(s=>still?s.pauseAnimations():s.unpauseAnimations());}
    /* الحروف تطلع من خلف الشمس للخارج */
    const L=smooth(.64,.9,p),Le=1-Math.pow(1-L,3);
    lettersEl.style.opacity=Math.min(1,L*1.6);
    lettersEl.style.clipPath=L>=1?'none':`circle(${(Le*112).toFixed(2)}% at 72.2% ${(SUN_Y*100).toFixed(1)}%)`;
    lettersEl.style.transform=`scale(${(.94+.06*Le).toFixed(4)})`;lettersEl.style.transformOrigin=`72.2% ${(SUN_Y*100).toFixed(1)}%`;
    const tf=smooth(0,.45,p);titleEl.style.transform=`translate3d(-50%,${-e*20*vh}px,0)`;titleEl.style.opacity=1-tf;titleEl.style.filter=tf>.01?`blur(${tf*8}px)`:'none';
    offB=e*36*vh;offF=e*60*vh;
    hillsEl.style.transform=`translate3d(0,${offB}px,0)`;mbc.style.transform=hazeEl.style.transform=`translate3d(0,${offB}px,0)`;mc.style.transform=`translate3d(0,${offF}px,0)`;
    streaks.style.opacity=1-smooth(.1,.6,p);veil.style.opacity=smooth(.32,.78,p);cue.style.opacity=1-smooth(0,.1,p)}
  let farC=null,time=0,last=performance.now(),lastP=-1,lastApplied=-1,heroBottom=1e9,dprCap=2,quality=1,slow=0;
  /* جودة تتكيّف: لو الجهاز بطيء نخفّف الرسم تلقائيًا عشان التمرير يبقى ناعم */
  function degrade(){if(dprCap>1){dprCap=Math.max(1,Math.min(window.devicePixelRatio||1,dprCap)-.5);resize()}else if(quality>.5){quality-=.25}}
  function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;if(!RM)time+=dt;
    st.p+=(st.t-st.p)*(RM?1:Math.min(1,dt*6.5));if(Math.abs(st.t-st.p)<.0004)st.p=st.t;
    if(st.p!==lastApplied){apply(st.p);lastApplied=st.p}
    const visible=window.scrollY<heroBottom&&st.p<.999;
    if(visible&&(!RM||st.p!==lastP)){drawClouds(RM?0:dt,st.p);drawMeadow(RM?0:dt);lastP=st.p;
      if(!RM&&!document.hidden){if(dt>.026)slow+=dt;else slow=Math.max(0,slow-dt*.5);if(slow>1.2){slow=0;degrade()}}}
    requestAnimationFrame(frame)}
  addEventListener('scroll',measure,{passive:true});
  let rz;addEventListener('resize',()=>{clearTimeout(rz);rz=setTimeout(()=>{if(stage.clientWidth===W&&Math.abs(stage.clientHeight-H)<2)return;resize()},150)});
  if(RM)document.querySelectorAll('#sun svg').forEach(s=>s.pauseAnimations&&s.pauseAnimations());
  resize();st.p=st.t;apply(st.p);requestAnimationFrame(frame);
})();

/* =======================================================
   4) LIBRARY — الرف، الفلاتر، المعرض، النافذة
   ======================================================= */
(() => {
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = id => document.getElementById(id);
  const ar = n => n.toLocaleString('ar-SA');
  const catOf = id => CATS.find(c => c.id === id);
  const state = { cat: 'all', level: 'all', list: [], idx: -1 };
  const LVL = ['سهل','متوسط','متقدم'];
  const minTxt = m => m >= 60 ? (m % 60 ? `${ar(Math.floor(m/60))} س و${ar(m%60)} د` : `${ar(m/60)} ${m/60===1?'ساعة':m/60===2?'ساعتين':'ساعات'}`) : `${ar(m)} دقيقة`;
  const inCat = (it, cat) => cat === 'all' || it.cat === cat;

  /* ---- toast ---- */
  let tt; function say(msg){ const t=$('toast'); t.textContent=msg; t.classList.add('show'); clearTimeout(tt); tt=setTimeout(()=>t.classList.remove('show'),2200); }

  /* ---- shelf ---- */
  const shelf = $('shelf');
  CATS.forEach(c => {
    const first = IDEAS.find(i => inCat(i, c.id));
    NOBG = true; const raw = artSVG(first); NOBG = false;
    const mini = raw.replace('<svg ', '<svg x="40" y="18" width="140" height="120" preserveAspectRatio="xMidYMid meet" ');
    const count = IDEAS.filter(i => inCat(i, c.id)).length;
    const b = document.createElement('button');
    b.className = 'boxbtn'; b.type = 'button'; b.role = 'tab'; b.id = 'tab-' + c.id; b.dataset.cat = c.id;
    b.setAttribute('aria-controls', 'gallery');
    b.innerHTML = `<svg viewBox="0 0 220 200" aria-hidden="true">
      <ellipse class="glowc" cx="110" cy="80" rx="96" ry="70" fill="#FFE9A8" opacity=".55"/>
      <path d="M30 92 L190 92 L190 120 L30 120Z" fill="#8E5C2E"/>
      <g class="peek">${mini}</g>
      <path d="M22 112 L198 112 L198 180 Q198 186 192 186 L28 186 Q22 186 22 180Z" fill="url(#kraftG)" stroke="#B9844F" stroke-width="2"/>
      <path d="M22 112 L198 112" stroke="#F0CFA6" stroke-width="3"/>
      <rect x="70" y="134" width="80" height="30" rx="6" fill="#FFF8EC" stroke="#C9A77D" stroke-width="1.4"/>
      <text x="110" y="155" text-anchor="middle" font-family="IBM Plex Sans Arabic, sans-serif" font-weight="600" font-size="15" fill="#8C5E36">${c.short}</text>
      <g class="lid"><path d="M18 74 L202 74 L202 98 Q202 102 198 102 L22 102 Q18 102 18 98Z" fill="#E6BC8D" stroke="#B9844F" stroke-width="2"/><use href="#sym-sun" x="96" y="76" width="24" height="24"/></g>
    </svg><span class="nm">${c.name}</span><span class="ct">${ar(count)} ${count > 2 && count < 11 ? 'أفكار' : 'فكرة'}</span>`;
    b.addEventListener('click', () => selectCat(c.id, true));
    shelf.appendChild(b);
  });

  /* ---- level chips (the only filter) ---- */
  const lvlEl = $('levelChips');
  [['all','كل المستويات'], ...LVL.map(l => [l, l])].forEach(([v, label]) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'chip'; b.dataset.v = v; b.textContent = label;
    b.setAttribute('aria-pressed', state.level === v);
    b.addEventListener('click', () => { state.level = v; lvlEl.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', c.dataset.v === v)); render(true); });
    lvlEl.appendChild(b);
  });

  /* ---- counters ---- */
  function countTo(el, n) {
    if (RM) { el.textContent = ar(n); return; }
    const t0 = performance.now();
    (function step(now){ const k = Math.min(1, (now - t0) / 900), e = 1 - Math.pow(1 - k, 3); el.textContent = ar(Math.round(n * e)); if (k < 1) requestAnimationFrame(step); })(t0);
  }
  $('statBoxes').textContent = ar(CATS.filter(c => c.id !== 'all').length);
  $('statIdeas').textContent = ar(IDEAS.length);
  if ('IntersectionObserver' in window) { const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { countTo($('statIdeas'), IDEAS.length); io.disconnect(); } }); io.observe($('statIdeas')); }

  /* ---- category + gallery ---- */
  const filtered = () => IDEAS.filter(i => inCat(i, state.cat) && (state.level === 'all' || i.lv === state.level));
  function selectCat(id, user) {
    if (!catOf(id)) return;
    const changed = state.cat !== id;
    state.cat = id;
    shelf.querySelectorAll('.boxbtn').forEach(b => { const on = b.dataset.cat === id; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
    const c = catOf(id), nameEl = $('catName');
    nameEl.firstChild.nodeValue = c.name;
    if (!RM && user) { nameEl.classList.add('draw'); void nameEl.offsetWidth; requestAnimationFrame(() => nameEl.classList.remove('draw')); }
    $('catDesc').textContent = c.desc;
    $('catBox').innerHTML = c.box.map(x => `<li>${x}</li>`).join('');
    $('catTime').textContent = 'الوقت: ' + c.time;
    if (user) {
      try { history.replaceState(null, '', '#' + id); } catch (e) {}
      const top = $('ideas').getBoundingClientRect().top;
      if (top > innerHeight * .6 || top < 0) window.scrollTo({ top: window.scrollY + top - 90, behavior: RM ? 'auto' : 'smooth' });
    }
    if (changed || !user) render(user);
  }
  const cardHTML = (it, i) => `<article class="card${i >= 0 ? ' enter' : ''}" style="--i:${Math.max(0,i)}" data-id="${it.id}">
      <button class="art-btn" type="button" aria-label="افتح فكرة ${it.t}"><span class="art">${artSVG(it)}</span></button>
      <div class="meta"><div><h3>${it.t}</h3><p>${catOf(it.cat).short} · ${it.lv} · ${minTxt(it.min)}</p></div></div>
    </article>`;
  const gal = $('gallery'); let renderT;
  function render(animate) {
    const list = filtered(); state.list = list;
    const draw = () => { gal.innerHTML = list.map((it, i) => cardHTML(it, animate && !RM ? i : -1)).join(''); $('empty').classList.toggle('on', !list.length); gal.classList.remove('out'); };
    clearTimeout(renderT);
    if (animate && !RM) { gal.classList.add('out'); renderT = setTimeout(draw, 220); } else draw();
  }
  gal.addEventListener('click', e => { const card = e.target.closest('.card'); if (card && e.target.closest('.art-btn')) openLB(card.dataset.id); });
  if (!RM && matchMedia('(hover:hover)').matches) {
    gal.addEventListener('pointermove', e => {
      const b = e.target.closest('.art-btn'); if (!b) return;
      const r = b.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      b.firstElementChild.style.transform = `rotateX(${(-y * 7).toFixed(2)}deg) rotateY(${(x * 9).toFixed(2)}deg) translateY(-4px)`;
    });
    gal.addEventListener('pointerout', e => { const b = e.target.closest('.art-btn'); if (b && !b.contains(e.relatedTarget)) b.firstElementChild.style.transform = ''; });
  }

  /* ---- lightbox ---- */
  const lb = $('lb'); let lastFocus = null;
  function fillLB(it) {
    const c = catOf(it.cat), P = PAL[it.p];
    $('lbArtInner').innerHTML = artSVG(it);
    $('lbCat').textContent = c.name;
    $('lbTitle').textContent = it.t;
    $('lbNote').textContent = it.note;
    $('lbFacts').innerHTML = [`المستوى: ${it.lv}`, `الوقت: ${minTxt(it.min)}`].map(x => `<span>${x}</span>`).join('');
    $('lbPalName').textContent = `الألوان · ${P.n}`;
    $('lbSw').innerHTML = P.c.map((h, i) => `<button class="sw" type="button" data-hex="${h}" aria-label="انسخ ${P.cn[i]} ${h}"><i style="background:${h}"></i><b>${P.cn[i]}</b><small>${h}</small></button>`).join('');
    $('lbSteps').innerHTML = c.steps.map(s => `<li>${s}</li>`).join('');
    $('lbTip').innerHTML = `<b>نصيحة:</b> ${it.tip}`;
    const rel = IDEAS.filter(i => i.cat === it.cat && i.id !== it.id).sort((a, b) => (a.id + it.id).localeCompare(b.id + it.id)).slice(0, 3);
    $('lbRel').innerHTML = rel.map(r => `<button type="button" data-id="${r.id}" aria-label="${r.t}">${artSVG(r).replace('<svg ', '<svg preserveAspectRatio="xMidYMid slice" ')}</button>`).join('');
    const pos = state.list.findIndex(i => i.id === it.id);
    $('lbCount').textContent = pos >= 0 ? `${ar(pos + 1)} / ${ar(state.list.length)}` : '';
    $('lbPrev').hidden = $('lbNext').hidden = pos < 0 || state.list.length < 2;
  }
  function openLB(id) {
    const i = IDEAS.findIndex(x => x.id === id); if (i < 0) return;
    if (!lb.classList.contains('open')) lastFocus = document.activeElement;
    state.idx = i; fillLB(IDEAS[i]);
    lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false'); document.body.classList.add('lock');
    $('lbClose').focus({ preventScroll: true });
    $('panel').scrollTop = 0; document.querySelector('.lb-info').scrollTop = 0;
  }
  function closeLB() {
    lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true'); state.idx = -1;
    document.body.classList.remove('lock');
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }
  function step(d) {
    const cur = IDEAS[state.idx], pos = state.list.findIndex(i => i.id === cur.id);
    if (pos < 0 || state.list.length < 2) return;
    const nx = state.list[(pos + d + state.list.length) % state.list.length];
    state.idx = IDEAS.indexOf(nx); fillLB(nx); pulse();
  }
  function pulse() { if (RM) return; const a = $('lbArt'); a.classList.remove('shuffle'); void a.offsetWidth; a.classList.add('shuffle'); }
  $('lbClose').addEventListener('click', closeLB);
  lb.addEventListener('click', e => { if (e.target === lb) closeLB(); });
  $('lbPrev').addEventListener('click', () => step(-1));
  $('lbNext').addEventListener('click', () => step(1));
  $('lbShuffle').addEventListener('click', pickForMe);
  $('lbRel').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { openLB(b.dataset.id); pulse(); } });
  $('lbSw').addEventListener('click', e => {
    const b = e.target.closest('.sw'); if (!b) return; const hex = b.dataset.hex;
    try { navigator.clipboard.writeText(hex).then(() => say(`نُسخ اللون ${hex}`), () => say(hex)); } catch (err) { say(hex); }
  });
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') closeLB();
    if (e.key === 'ArrowLeft') step(1); if (e.key === 'ArrowRight') step(-1);
    if (e.key === 'Tab') { const f = [...lb.querySelectorAll('button:not([hidden])')]; const i = f.indexOf(document.activeElement); if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); } }
  });
  let sx = null;
  $('lbArt').addEventListener('pointerdown', e => { sx = e.clientX; });
  $('lbArt').addEventListener('pointerup', e => { if (sx === null) return; const dx = e.clientX - sx; sx = null; if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1); });

  /* ---- اختر لي: عشوائي من الصندوق المختار، أو من الكل ---- */
  function pickForMe() {
    const pool = state.list.length ? state.list : IDEAS.filter(i => inCat(i, state.cat));
    const cur = state.idx >= 0 ? IDEAS[state.idx].id : null;
    let final; do { final = pool[(Math.random() * pool.length) | 0]; } while (pool.length > 1 && final.id === cur);
    openLB(final.id);
    if (RM) return;
    let n = 0;
    (function spin() {
      if (n++ < 7) { $('lbArtInner').innerHTML = artSVG(pool[(Math.random() * pool.length) | 0]); pulse(); setTimeout(spin, 70 + n * 18); }
      else { fillLB(final); pulse(); }
    })();
  }
  $('inspireBtn').addEventListener('click', pickForMe);

  /* ---- boot ---- */
  const h = (location.hash || '').slice(1);
  selectCat(catOf(h) ? h : 'all', false);
})();

/* =======================================================
   5) SHARE — "شاركنا لمستك": صورة + اسم + نوع الصندوق + موافقة
   تنرسل لإيميلكم عبر FormSubmit (مجاني) بدون ما يطلع الشخص من الموقع
   ======================================================= */
(() => {
  const $ = id => document.getElementById(id);
  const form = $('shareForm'); if (!form) return;
  const fileIn = $('shareFile'), drop = $('drop'), prev = $('sharePreview'), empty = drop.querySelector('.drop-empty');
  const nameIn = $('shareName'), anon = $('shareAnon'), boxSel = $('shareBox'), consent = $('shareConsent');
  const err = $('shareErr'), send = $('shareSend'), done = $('shareDone');
  let picked = null;
  const honey = $('shareHoney');
  const WAIT = 60 * 1000; // دقيقة بين كل إرسال والثاني من نفس الجهاز
  const lastSent = () => { try { return +localStorage.getItem('lamsa-last-share') || 0; } catch (e) { return 0; } };
  /* إطار مخفي يستقبل الإرسال عشان الصفحة ما تتغير */
  const frame = document.createElement('iframe'); frame.name = frame.id = 'shareFrame'; frame.hidden = true; frame.title = 'إرسال'; frame.setAttribute('aria-hidden', 'true'); document.body.appendChild(frame);

  (SHARE.boxes || []).forEach(b => { const o = document.createElement('option'); o.value = o.textContent = b; boxSel.appendChild(o); });

  const showErr = m => { err.textContent = m; err.hidden = !m; };
  function setFile(file) {
    if (!file) return;
    if (!/^image\//.test(file.type) && !/\.(jpe?g|png|webp|heic|heif)$/i.test(file.name)) { showErr('الملف لازم يكون صورة (JPG أو PNG).'); return; }
    if (file.size > 25 * 1024 * 1024) { showErr('الصورة كبيرة مرة (أكثر من ٢٥ ميجا). جرّب صورة ثانية.'); return; }
    picked = file; showErr('');
    const url = URL.createObjectURL(file);
    prev.onload = () => URL.revokeObjectURL(url);
    prev.src = url; prev.hidden = false; empty.hidden = true; drop.classList.add('has');
  }
  fileIn.addEventListener('change', () => setFile(fileIn.files[0]));
  ['dragenter','dragover'].forEach(t => drop.addEventListener(t, e => { e.preventDefault(); drop.classList.add('over'); }));
  ['dragleave','drop'].forEach(t => drop.addEventListener(t, e => { e.preventDefault(); drop.classList.remove('over'); }));
  drop.addEventListener('drop', e => setFile(e.dataTransfer.files[0]));
  anon.addEventListener('change', () => { nameIn.disabled = anon.checked; if (anon.checked) nameIn.value = ''; });

  /* يصغّر الصورة قبل الإرسال عشان تكون خفيفة وتحت حد ١٠ ميجا */
  function shrink(file) {
    return new Promise(res => {
      const img = new Image(), url = URL.createObjectURL(file);
      img.onload = () => {
        const k = Math.min(1, 1800 / Math.max(img.naturalWidth, img.naturalHeight));
        const c = document.createElement('canvas'); c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
        c.toBlob(b => res(b ? new File([b], 'lamsa-share.jpg', { type: 'image/jpeg' }) : file), 'image/jpeg', .86);
      };
      img.onerror = () => { URL.revokeObjectURL(url); res(file); };
      img.src = url;
    });
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!picked) return showErr('اختر صورة لقطعتك أول.');
    if (!anon.checked && !nameIn.value.trim()) return showErr('اكتب اسمك، أو اختر "أبغى أكون مجهول".');
    if (!consent.checked) return showErr('لازم توافق على عرض الصورة قبل الإرسال.');
    if (!SHARE.email) return showErr('ما تم ضبط إيميل الاستقبال في الموقع بعد.');
    if (honey && honey.value) return;                       // روبوت سبام: نتجاهله بهدوء
    if (navigator.onLine === false) return showErr('ما فيه اتصال بالإنترنت. تأكد من الاتصال وجرّب مرة ثانية.');
    const wait = WAIT - (Date.now() - lastSent());
    if (wait > 0) return showErr(`أرسلت قبل شوي. تقدر ترسل مرة ثانية بعد ${Math.ceil(wait / 1000)} ثانية.`);
    showErr(''); send.disabled = true; send.textContent = 'جاري الإرسال…';

    const file = await shrink(picked);
    const f = document.createElement('form');
    f.action = 'https://formsubmit.co/' + SHARE.email; f.method = 'POST'; f.enctype = 'multipart/form-data'; f.target = 'shareFrame'; f.hidden = true;
    const who = anon.checked ? 'مجهول' : nameIn.value.trim();
    const fields = { _subject: 'لمسة جديدة من ' + who, _captcha: 'false', _template: 'table', _honey: '', 'الاسم': who, 'نوع الصندوق': boxSel.value, 'الموافقة على العرض': 'نعم' };
    for (const k in fields) { const i = document.createElement('input'); i.type = 'hidden'; i.name = k; i.value = fields[k]; f.appendChild(i); }
    const fi = document.createElement('input'); fi.type = 'file'; fi.name = 'الصورة';
    let attached = false;
    try { const dt = new DataTransfer(); dt.items.add(file); fi.files = dt.files; attached = fi.files.length === 1; } catch (x) {}
    let moved = null;
    if (!attached && fileIn.files.length && fileIn.files[0] === picked) { moved = fileIn; fileIn.name = 'الصورة'; f.appendChild(fileIn); attached = true; } // متصفحات قديمة
    if (!attached) { send.disabled = false; send.textContent = 'أرسل لمستك'; return showErr('متصفحك ما يدعم إرفاق الصورة بالسحب. اضغط على المربع واختر الصورة من جهازك.'); }
    if (!moved) f.appendChild(fi);
    document.body.appendChild(f);

    let settled = false;
    const finish = ok => {
      if (settled) return; settled = true; if (moved) { moved.removeAttribute('name'); drop.prepend(moved); } f.remove(); send.disabled = false; send.textContent = 'أرسل لمستك';
      if (ok) { try { localStorage.setItem('lamsa-last-share', Date.now()); } catch (e) {} form.classList.add('sent'); done.hidden = false; done.querySelector('button').focus(); }
      else showErr('ما قدرنا نرسل الصورة. تأكد من الاتصال وجرّب مرة ثانية.');
    };
    frame.onload = () => finish(true);
    setTimeout(() => finish(false), 45000);
    f.submit();
  });

  $('shareAgain').addEventListener('click', () => {
    form.reset(); picked = null; prev.hidden = true; prev.removeAttribute('src'); empty.hidden = false; drop.classList.remove('has');
    nameIn.disabled = false; form.classList.remove('sent'); done.hidden = true; showErr('');
  });
})();
