<!DOCTYPE html>

<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Seu Mapa de Desenho Humano — Vida Autoral</title>
  <link rel="canonical" href="https://vidaautoral.com.br/mapa" />
  <link href="https://fonts.googleapis.com/css2?family=Aboreto&family=Work+Sans:wght@200;300;400&display=swap" rel="stylesheet" />
  <script type="text/javascript">
    (function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","vuregurh46");
  </script>
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    :root{
      --milky-coffee:#9B7D61;--roasted-peach:#DAA38F;--whole-wheat:#E9D7C0;
      --eucalyptus:#92ADA4;--cream:#FED8A6;--white:#FFFFFF;--dark:#1a1410;
      --salmon:#C7826F;--mint:#7DAAA0;--gray-lt:#F5F4F2;
      --text-dark:#2E2419;--text-med:#6B5A4B;
    }
    html{scroll-behavior:smooth}
    body{font-family:'Work Sans',sans-serif;font-weight:300;background-color:var(--whole-wheat);color:var(--dark);overflow-x:hidden}

```
/* HERO */
.hero{min-height:100vh;background:linear-gradient(160deg,var(--dark) 0%,#2e1f14 55%,#4a2e1e 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:4rem 2rem;position:relative;overflow:hidden}
.hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 60% 50% at 80% 20%,rgba(155,125,97,.18) 0%,transparent 60%),radial-gradient(ellipse 40% 40% at 10% 80%,rgba(146,173,164,.12) 0%,transparent 60%);pointer-events:none}
.hero-triangle{width:80px;height:80px;margin-bottom:2rem;opacity:.92;animation:fadeDown 1s ease both}
.hero-triangle svg{width:100%;height:100%;display:block}
.hero-eyebrow{font-weight:200;font-size:.78rem;letter-spacing:.35em;text-transform:uppercase;color:var(--roasted-peach);margin-bottom:1.4rem;animation:fadeDown 1s .1s ease both}
.hero-title{font-family:'Aboreto',cursive;font-size:clamp(2.2rem,5.5vw,4rem);color:var(--whole-wheat);text-align:center;line-height:1.15;letter-spacing:.04em;max-width:700px;margin-bottom:1.8rem;animation:fadeDown 1s .2s ease both}
.hero-title em{font-style:normal;color:var(--roasted-peach)}
.hero-sub{font-size:1.05rem;font-weight:200;color:rgba(233,215,192,.75);text-align:center;max-width:520px;line-height:1.8;margin-bottom:3rem;animation:fadeDown 1s .3s ease both}
.hero-cta{display:inline-block;background:var(--milky-coffee);color:var(--white);font-weight:300;font-size:.85rem;letter-spacing:.2em;text-transform:uppercase;text-decoration:none;padding:1rem 2.6rem;border:1px solid rgba(218,163,143,.3);transition:background .3s;animation:fadeDown 1s .4s ease both}
.hero-cta:hover{background:#7d6249}
.hero-scroll{position:absolute;bottom:2rem;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:.5rem;opacity:.45;animation:pulse 2.5s ease-in-out infinite}
.hero-scroll span{font-size:.65rem;letter-spacing:.25em;text-transform:uppercase;color:var(--whole-wheat)}
.hero-scroll-line{width:1px;height:40px;background:linear-gradient(to bottom,var(--whole-wheat),transparent)}

/* STRIP */
.strip{background:var(--milky-coffee);padding:1.4rem 2rem;display:flex;justify-content:center;gap:3rem;flex-wrap:wrap}
.strip-item{font-size:.75rem;letter-spacing:.22em;text-transform:uppercase;color:var(--whole-wheat);font-weight:300;display:flex;align-items:center;gap:.6rem}
.strip-item::before{content:'◇';color:var(--roasted-peach);font-size:.6rem}

/* FORM */
.form-section{padding:6rem 2rem;background:linear-gradient(170deg,var(--whole-wheat) 0%,var(--cream) 100%)}
.form-inner{max-width:580px;margin:0 auto}
.section-label{font-size:.72rem;letter-spacing:.3em;text-transform:uppercase;color:var(--milky-coffee);margin-bottom:1rem}
.section-title{font-family:'Aboreto',cursive;font-size:clamp(1.6rem,3vw,2.2rem);color:var(--dark);margin-bottom:.8rem}
.form-intro{font-size:.93rem;line-height:1.8;color:#5a4535;margin-bottom:2.5rem}
.form-group{margin-bottom:1.5rem}
.form-group label{display:block;font-size:.72rem;letter-spacing:.2em;text-transform:uppercase;color:var(--milky-coffee);margin-bottom:.5rem}
.form-group input{width:100%;background:var(--white);border:1px solid rgba(155,125,97,.3);padding:.9rem 1.1rem;font-family:'Work Sans',sans-serif;font-weight:300;font-size:.93rem;color:var(--dark);outline:none;transition:border-color .2s;-webkit-appearance:none;appearance:none}
.form-group input:focus{border-color:var(--milky-coffee)}
.form-group input::placeholder{color:#b8a090}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
@media(max-width:480px){.form-row{grid-template-columns:1fr}}
.form-steps-indicator{display:flex;align-items:center;justify-content:center;margin-bottom:2rem}
.step-dot{width:10px;height:10px;border-radius:50%;border:1.5px solid var(--milky-coffee);background:transparent;transition:all .3s}
.step-dot.active{background:var(--milky-coffee);box-shadow:0 0 0 3px rgba(155,125,97,.2)}
.step-dot.done{background:var(--eucalyptus);border-color:var(--eucalyptus)}
.step-line{width:60px;height:1.5px;background:rgba(155,125,97,.25)}
.step-line.filled{background:var(--eucalyptus)}
.step-2-greeting{font-family:'Aboreto',cursive;font-size:1.1rem;color:var(--milky-coffee);margin-bottom:1.8rem;line-height:1.5}
.step-2-buttons{display:flex;gap:1rem;margin-top:2rem;align-items:stretch}
.form-back{background:transparent;border:1px solid rgba(155,125,97,.3);color:var(--milky-coffee);font-family:'Work Sans',sans-serif;font-weight:300;font-size:.82rem;letter-spacing:.15em;text-transform:uppercase;padding:1.1rem 1.4rem;cursor:pointer;white-space:nowrap}
.form-submit{margin-top:2rem;width:100%;background:var(--dark);color:var(--whole-wheat);border:none;font-family:'Work Sans',sans-serif;font-weight:300;font-size:.85rem;letter-spacing:.25em;text-transform:uppercase;padding:1.1rem 2rem;cursor:pointer;position:relative;overflow:hidden;transition:background .3s}
.form-submit::after{content:'';position:absolute;inset:0;background:var(--milky-coffee);transform:scaleX(0);transform-origin:left;transition:transform .4s ease}
.form-submit:hover::after{transform:scaleX(1)}
.form-submit span{position:relative;z-index:1}
#step-2 .form-submit{margin-top:0}
.form-privacy{font-size:.75rem;color:#9b836f;margin-top:1rem;line-height:1.6;text-align:center}
.city-dropdown{list-style:none;position:absolute;top:100%;left:0;right:0;background:var(--white);border:1px solid rgba(155,125,97,.3);border-top:none;max-height:220px;overflow-y:auto;z-index:100;display:none;box-shadow:0 8px 24px rgba(26,20,16,.15)}
.city-dropdown.open{display:block}
.city-dropdown li{padding:.75rem 1.1rem;font-weight:300;font-size:.9rem;color:var(--dark);cursor:pointer;border-bottom:1px solid rgba(155,125,97,.08);transition:background .15s}
.city-dropdown li:hover,.city-dropdown li.active{background:var(--cream)}
.city-dropdown li .city-country{font-size:.75rem;color:var(--milky-coffee);margin-left:.4rem}
#local-input.city-selected{border-color:var(--eucalyptus)}
.form-group.city-autocomplete-wrapper{position:relative;z-index:10}

/* LOADING */
#loading-overlay{display:none;position:fixed;inset:0;background:linear-gradient(160deg,var(--dark) 0%,#2e1f14 55%,#4a2e1e 100%);z-index:9999;align-items:center;justify-content:center;flex-direction:column;padding:2rem}
#loading-overlay.active{display:flex;animation:fadeIn .4s ease}
.loading-ring{width:56px;height:56px;border:1.5px solid rgba(218,163,143,.2);border-top-color:var(--roasted-peach);border-radius:50%;animation:spin 1.2s linear infinite;margin-bottom:2.5rem}
.loading-title{font-family:'Aboreto',cursive;font-size:clamp(1.3rem,3vw,1.8rem);color:var(--whole-wheat);text-align:center;letter-spacing:.06em;margin-bottom:.8rem}
.loading-subtitle{font-size:.8rem;font-weight:200;letter-spacing:.2em;text-transform:uppercase;color:rgba(218,163,143,.6);margin-bottom:3rem}
.loading-steps{display:flex;flex-direction:column;gap:.9rem;width:100%;max-width:320px}
.loading-step{display:flex;align-items:center;gap:1rem;opacity:0;transform:translateX(-12px);transition:opacity .4s ease,transform .4s ease}
.loading-step.visible{opacity:1;transform:translateX(0)}
.loading-step-dot{width:7px;height:7px;border-radius:50%;border:1px solid rgba(155,125,97,.5);background:transparent;flex-shrink:0;transition:all .3s}
.loading-step.done .loading-step-dot{background:var(--eucalyptus);border-color:var(--eucalyptus)}
.loading-step span{font-size:.82rem;font-weight:200;letter-spacing:.08em;color:rgba(233,215,192,.6)}
.loading-step.done span{color:rgba(233,215,192,.9)}

/* RESULTADO */
#result-section{display:none;background:linear-gradient(170deg,var(--whole-wheat) 0%,var(--cream) 60%)}
#result-section.visible{display:block}
.result-hero{background:linear-gradient(160deg,var(--dark) 0%,#2e1f14 55%,#4a2e1e 100%);padding:5rem 2rem 4rem;text-align:center;position:relative;overflow:hidden}
.result-hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 60% 50% at 80% 20%,rgba(155,125,97,.18) 0%,transparent 60%),radial-gradient(ellipse 40% 40% at 10% 80%,rgba(146,173,164,.12) 0%,transparent 60%);pointer-events:none}
.result-eyebrow{font-size:.72rem;letter-spacing:.3em;text-transform:uppercase;color:var(--roasted-peach);margin-bottom:1rem;position:relative;z-index:1}
.result-name-display{font-family:'Aboreto',cursive;font-size:clamp(1.8rem,4vw,2.8rem);color:var(--whole-wheat);line-height:1.2;letter-spacing:.04em;margin-bottom:.6rem;position:relative;z-index:1}
.result-name-display em{font-style:normal;color:var(--roasted-peach)}
.result-type-tag{display:inline-block;border:1px solid rgba(218,163,143,.35);padding:.4rem 1.2rem;font-size:.72rem;letter-spacing:.2em;text-transform:uppercase;color:rgba(218,163,143,.8);margin-top:.8rem;position:relative;z-index:1}

/* BODYGRAPH SECTION */
.bodygraph-full-section{max-width:700px;margin:0 auto;padding:3rem 1.5rem 1rem}
.bodygraph-full-label{font-size:.72rem;letter-spacing:.3em;text-transform:uppercase;color:var(--milky-coffee);margin-bottom:1.2rem}
.bodygraph-full-wrap{background:var(--white);border:1px solid rgba(155,125,97,.2);overflow:hidden}
.bodygraph-arrows{display:flex;justify-content:space-between;padding:8px 16px 0;background:var(--white)}
.arrow-pair{display:flex;gap:10px}
.arrow-item{font-size:.68rem;color:var(--text-med);display:flex;align-items:center;gap:3px}
.arrow-item .arr{font-size:1rem;font-weight:400}
.arrow-item.design-color .arr{color:var(--salmon)}
.arrow-item.personality-color .arr{color:var(--mint)}
.bodygraph-layout{display:grid;grid-template-columns:76px 1fr 76px}
.planet-col{display:flex;flex-direction:column;padding:6px 3px;background:var(--white)}
.planet-col-label{font-size:.5rem;letter-spacing:.12em;text-transform:uppercase;text-align:center;padding:3px 0 6px;font-weight:400}
.planet-col.design .planet-col-label{color:var(--salmon)}
.planet-col.personality .planet-col-label{color:var(--mint)}
.planet-pill{display:flex;align-items:center;border-radius:3px;padding:2px 4px;margin-bottom:2px;min-height:20px;gap:3px}
.planet-col.design .planet-pill{background:var(--salmon)}
.planet-col.personality .planet-pill{background:var(--mint)}
.planet-pill.empty{background:#EDEBE8}
.planet-sym{font-size:.7rem;color:white;flex-shrink:0;width:13px;text-align:center}
.planet-gate{font-size:.58rem;color:white;font-weight:400;white-space:nowrap}
.bodygraph-svg-col{display:flex;align-items:center;justify-content:center}
#bodygraph-svg-wrap{width:100%}
#bodygraph-svg-wrap svg{width:100%;height:auto;display:block}

/* CARDS SECTION */
.result-cards-section{max-width:700px;margin:0 auto;padding:1.5rem 1.5rem .5rem}
.gates-channels-wrap{background:var(--white);border:1px solid rgba(155,125,97,.2);padding:1.4rem 1.4rem 1rem;margin-bottom:1rem;position:relative}
.gates-channels-wrap::before{content:'';position:absolute;top:0;left:0;width:3px;height:100%;background:linear-gradient(to bottom,var(--roasted-peach),var(--milky-coffee))}
.gates-row-label{font-size:.62rem;letter-spacing:.18em;text-transform:uppercase;color:var(--milky-coffee);margin-bottom:.5rem}
.gates-tags{display:flex;flex-wrap:wrap;gap:.3rem;margin-bottom:.8rem}
.gate-tag{padding:.2rem .55rem;border-radius:100px;background:var(--eucalyptus);font-size:.7rem;color:white;font-weight:300}
.channel-tag{padding:.2rem .55rem;border-radius:100px;background:rgba(233,215,192,.7);border:1px solid rgba(155,125,97,.3);font-size:.7rem;color:var(--text-med);font-weight:300}
.info-cards-grid{display:grid;grid-template-columns:1fr 1fr;gap:.8rem;margin-bottom:.8rem}
@media(max-width:480px){.info-cards-grid{grid-template-columns:1fr}}
.info-card{background:var(--white);border:1px solid rgba(155,125,97,.2);padding:1.2rem 1.2rem 0;position:relative;overflow:hidden}
.info-card::before{content:'';position:absolute;top:0;left:0;width:3px;height:100%;background:linear-gradient(to bottom,var(--roasted-peach),var(--milky-coffee))}
.info-card-full{grid-column:1 / -1}
.info-card-topic{font-size:.62rem;letter-spacing:.2em;text-transform:uppercase;color:var(--milky-coffee);margin-bottom:.3rem}
.info-card-value{font-family:'Aboreto',cursive;font-size:.95rem;color:var(--dark);margin-bottom:.4rem}
.info-card-preview{font-size:.82rem;line-height:1.7;color:#5a4535;padding-bottom:.7rem}
.info-card-locked{position:relative;padding-bottom:1.8rem}
.info-card-locked-text{font-size:.82rem;line-height:1.7;color:#5a4535;filter:blur(4px);user-select:none;pointer-events:none}
.info-card-lock-bar{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:linear-gradient(to bottom,rgba(255,255,255,0) 0%,rgba(255,255,255,.94) 40%)}
.info-card-lock-bar span{font-size:.62rem;letter-spacing:.12em;text-transform:uppercase;color:var(--milky-coffee)}

/* UPSELL */
.upsell-wrapper{max-width:700px;margin:0 auto;padding:1.5rem 1.5rem 5rem}
.upsell-btn{width:100%;background:var(--milky-coffee);color:var(--white);border:none;font-family:'Work Sans',sans-serif;font-weight:300;font-size:.85rem;letter-spacing:.25em;text-transform:uppercase;padding:1.2rem 2rem;cursor:pointer;position:relative;overflow:hidden;transition:background .3s}
.upsell-btn::after{content:'';position:absolute;inset:0;background:#7d6249;transform:scaleX(0);transform-origin:left;transition:transform .4s ease}
.upsell-btn:hover::after{transform:scaleX(1)}
.upsell-btn span{position:relative;z-index:1}
.upsell-skip{display:block;text-align:center;margin-top:1rem;font-size:.75rem;font-weight:200;letter-spacing:.1em;color:rgba(90,69,53,.4);cursor:pointer;background:none;border:none;width:100%;transition:color .2s}
.upsell-skip:hover{color:rgba(90,69,53,.7)}

/* WHAT */
.what{padding:6rem 2rem;max-width:900px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:5rem;align-items:center}
@media(max-width:680px){.what{grid-template-columns:1fr;gap:2.5rem}}
.what-label{font-size:.72rem;letter-spacing:.3em;text-transform:uppercase;color:var(--milky-coffee);margin-bottom:1.2rem}
.what-title{font-family:'Aboreto',cursive;font-size:clamp(1.7rem,3vw,2.4rem);color:var(--dark);line-height:1.25;margin-bottom:1.5rem}
.what-body{font-size:.95rem;line-height:1.9;color:#4a3a2e}
.what-body p+p{margin-top:1rem}
.what-visual{display:flex;align-items:center;justify-content:center}
.what-photo{width:100%;max-width:380px;overflow:hidden}
.what-photo img{width:100%;height:100%;object-fit:cover;display:block;filter:sepia(.1) saturate(.9)}

/* BENEFITS */
.benefits{background:#faf4ec;padding:5rem 2rem}
.benefits-inner{max-width:860px;margin:0 auto}
.section-label-c{font-size:.72rem;letter-spacing:.3em;text-transform:uppercase;color:var(--milky-coffee);text-align:center;margin-bottom:1rem}
.section-title-c{font-family:'Aboreto',cursive;font-size:clamp(1.6rem,3vw,2.2rem);text-align:center;color:var(--dark);margin-bottom:3.5rem}
.benefits-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:2rem}
.benefit-card{background:var(--white);border:1px solid rgba(155,125,97,.15);padding:2rem 1.8rem;position:relative}
.benefit-card::before{content:'';position:absolute;top:0;left:0;width:3px;height:100%;background:linear-gradient(to bottom,var(--roasted-peach),var(--milky-coffee))}
.benefit-icon{font-size:1.4rem;margin-bottom:1rem}
.benefit-title{font-family:'Aboreto',cursive;font-size:1rem;color:var(--milky-coffee);margin-bottom:.6rem}
.benefit-text{font-size:.87rem;line-height:1.75;color:#5a4535}

/* TESTIMONIALS */
.testimonials{padding:6rem 2rem;background:linear-gradient(160deg,var(--dark) 0%,#2e1f14 100%)}
.testimonials-grid{max-width:900px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:2rem}
.testimonial-card{background:rgba(255,255,255,.04);border:1px solid rgba(155,125,97,.22);padding:2.2rem 2rem 2rem;position:relative;display:flex;flex-direction:column}
.testimonial-card::before{content:'\201C';font-family:'Aboreto',cursive;font-size:4rem;color:var(--roasted-peach);opacity:.35;position:absolute;top:.6rem;left:1.4rem;line-height:1}
.testimonial-stars{color:var(--roasted-peach);font-size:.7rem;letter-spacing:.15em;opacity:.85;margin-bottom:1.1rem;padding-top:1.2rem}
.testimonial-text{font-size:.93rem;line-height:1.85;color:rgba(233,215,192,.82);margin-bottom:1.8rem;font-style:italic;flex:1}
.testimonial-author{display:flex;align-items:center;gap:.9rem}
.testimonial-avatar{width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,var(--milky-coffee),var(--roasted-peach));display:flex;align-items:center;justify-content:center;font-family:'Aboreto',cursive;font-size:.8rem;color:var(--white);flex-shrink:0}
.testimonial-name{font-family:'Aboreto',cursive;font-size:.85rem;color:var(--whole-wheat);letter-spacing:.06em}
.testimonial-role{font-size:.72rem;color:var(--roasted-peach);letter-spacing:.15em;text-transform:uppercase;margin-top:.15rem}

/* FOOTER */
footer{background:var(--dark);padding:2rem 2rem 1.2rem;text-align:center}
.footer-logo{display:flex;align-items:center;justify-content:center;gap:.8rem;margin-bottom:1rem}
.footer-logo-text{font-family:'Aboreto',cursive;font-size:1rem;letter-spacing:.15em;color:var(--whole-wheat)}
footer p{font-size:.75rem;color:rgba(233,215,192,.35);letter-spacing:.1em}

/* ANIMATIONS */
@keyframes fadeDown{from{opacity:0;transform:translateY(-18px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes pulse{0%,100%{opacity:.45;transform:translateX(-50%) translateY(0)}50%{opacity:.7;transform:translateX(-50%) translateY(6px)}}
.reveal{opacity:0;transform:translateY(24px);transition:opacity .7s ease,transform .7s ease}
.reveal.visible{opacity:1;transform:translateY(0)}
.reveal-delay-1{transition-delay:.1s}.reveal-delay-2{transition-delay:.2s}
.reveal-delay-3{transition-delay:.3s}.reveal-delay-4{transition-delay:.4s}
.result-reveal{opacity:0;transform:translateY(20px);transition:opacity .6s ease,transform .6s ease}
.result-reveal.visible{opacity:1;transform:translateY(0)}
.result-reveal-1{transition-delay:.1s}.result-reveal-2{transition-delay:.2s}
.result-reveal-3{transition-delay:.35s}.result-reveal-4{transition-delay:.5s}
.result-reveal-5{transition-delay:.65s}
```

  </style>
</head>
<body>

<!-- HERO -->

<section class="hero" id="top">
  <div class="hero-triangle"><svg fill="#9B7D61" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2000 2000"><path fill="none" d="M0 0L2000 0L2000 2000L0 2000L0 0Z"/><path d="M495.008 541.153C532.838 540.453 572.702 541.02 610.683 541.009L835.063 540.986L1456.93 541.046C1452.5 550.534 1441.44 568.389 1435.88 577.988L1396.86 645.615L1268.67 866.177L1077.79 1196.82C1052.94 1239.79 1026.8 1286.99 1001.12 1329.18L994.755 1318.27L1016.44 1280.76C1042.45 1233.01 1073.89 1182.25 1101.12 1134.79L1313.87 766.311L1388.74 636.178C1402.02 613.342 1425.51 575.523 1436.72 552.474L514.426 552.506C523.03 570.276 536.867 591.461 546.571 609.749L535.211 612.319C526.893 597.837 518.483 583.408 509.981 569.034C505.249 560.95 498.114 549.693 495.008 541.153Z"/><path d="M555.399 640.08C604.571 639.723 653.744 639.78 702.914 640.251L919.63 640.254L1358.05 639.898C1355.7 643.703 1353.11 647.593 1350.68 651.372C1316.3 652.596 1273.66 651.416 1238.76 651.4L1017.04 651.408L456.756 653.341C462.072 664.311 471.807 680.157 478.072 691.12L523.976 770.694L672.956 1028.47L844.102 1323.84L888.012 1400.27C895.624 1413.69 909.736 1439.81 918.442 1450.84C925.488 1441.64 944.045 1407.75 950.819 1395.92L957.106 1406.67C946.814 1425.98 929.942 1454.89 918.364 1473.23C912.509 1465.48 895.622 1434.5 889.821 1424.51L828.691 1319.39L638.202 989.146L494.516 741.641L456.968 677.577C451.239 667.791 441.618 652.376 437.434 642.357C462.149 641.127 489.779 642.684 514.806 641.958C529.622 641.528 540.135 642.556 555.399 640.08Z"/><path d="M1431.47 640.059C1457.67 639.918 1485.49 639.647 1511.61 640.344C1502.37 658.63 1486.3 684.696 1475.63 702.693L1431.35 779.026L1267.16 1062.6L1114.24 1327.39L1061.83 1417.41C1051.84 1434.75 1041.05 1455.34 1030.32 1471.88C1019.8 1455.81 1010.36 1436.09 1000.46 1419.42L897.1 1241.59L591.619 714.378C587.134 706.851 582.773 699.249 578.539 691.577L591.334 691.22L896.992 1219.93L982.889 1367.62C993.498 1386.15 1018.41 1433.32 1030.62 1449.27C1036.14 1441.63 1043.73 1427.37 1048.76 1418.81L1093.57 1340.95L1253.6 1064.06C1326.66 937.665 1400.05 811.451 1472.73 684.838C1478.97 673.957 1486.05 662.885 1491.21 651.488L1423.36 651.469C1425.67 647.521 1428 642.862 1431.47 640.059Z"/></svg></div>
  <p class="hero-eyebrow">Vida Autoral · Desenho Humano</p>
  <h1 class="hero-title">Descubra o seu<br/><em>mapa energético</em><br/>único</h1>
  <p class="hero-sub">Seu Desenho Humano revela como você foi desenhada para tomar decisões, usar sua energia e viver com autenticidade. Receba seu gráfico personalizado — gratuitamente.</p>
  <a href="#formulario" class="hero-cta">Quero meu mapa</a>
  <div class="hero-scroll"><span>Rolar</span><div class="hero-scroll-line"></div></div>
</section>

<div class="strip">
  <div class="strip-item">Gratuito</div>
  <div class="strip-item">Personalizado</div>
  <div class="strip-item">Entregue por e-mail</div>
</div>

<!-- FORMULÁRIO -->

<section class="form-section" id="formulario">
  <div class="form-inner">
    <p class="section-label reveal">Seu gráfico personalizado</p>
    <h2 class="section-title reveal reveal-delay-1">Receba seu mapa<br/>de Desenho Humano</h2>
    <p class="form-intro reveal reveal-delay-2">Preencha os dados abaixo com atenção — especialmente o horário de nascimento, pois ele define sua Autoridade e centros de energia.</p>
    <form id="hd-form" novalidate>
      <div id="step-1">
        <div class="form-steps-indicator"><div class="step-dot active"></div><div class="step-line"></div><div class="step-dot"></div></div>
        <div class="form-group reveal"><label for="nome">Nome completo</label><input type="text" id="nome" name="nome" placeholder="Como você prefere ser chamada" required/></div>
        <div class="form-group reveal reveal-delay-1"><label for="email">E-mail</label><input type="email" id="email" name="email" placeholder="seu@email.com" required/></div>
        <div class="form-group reveal reveal-delay-2"><label for="telefone">WhatsApp</label><input type="tel" id="telefone" name="telefone" placeholder="(00) 00000-0000" required/></div>
        <button type="button" class="form-submit reveal reveal-delay-3" id="next-btn"><span>Continuar →</span></button>
      </div>
      <div id="step-2" style="display:none;">
        <div class="form-steps-indicator"><div class="step-dot done"></div><div class="step-line filled"></div><div class="step-dot active"></div></div>
        <p class="step-2-greeting" id="step-2-greeting"></p>
        <div class="form-row reveal">
          <div class="form-group"><label for="data">Data de nascimento</label><input type="date" id="data" name="data" required/></div>
          <div class="form-group"><label for="hora">Horário de nascimento</label><input type="time" id="hora" name="hora" required/></div>
        </div>
        <div class="form-group city-autocomplete-wrapper reveal reveal-delay-1">
          <label for="local-input">Cidade de nascimento</label>
          <input type="text" id="local-input" autocomplete="off" placeholder="Comece a digitar sua cidade…" required/>
          <input type="hidden" id="local" name="local"/>
          <ul id="city-dropdown" class="city-dropdown"></ul>
        </div>
        <div class="step-2-buttons reveal reveal-delay-2">
          <button type="button" class="form-back" id="back-btn">← Voltar</button>
          <button type="submit" class="form-submit" id="submit-btn" style="flex:1;"><span id="submit-label">Gerar meu mapa →</span></button>
        </div>
      </div>
      <p class="form-privacy reveal">Seus dados são usados exclusivamente para gerar seu gráfico de Desenho Humano.<br/>Não compartilhamos com terceiros.</p>
    </form>
  </div>
</section>

<!-- LOADING -->

<div id="loading-overlay">
  <div class="loading-ring"></div>
  <h2 class="loading-title">Mapeando sua configuração</h2>
  <p class="loading-subtitle">Isso leva apenas alguns segundos</p>
  <div class="loading-steps">
    <div class="loading-step" id="lstep-1"><div class="loading-step-dot"></div><span>Localizando posição dos planetas…</span></div>
    <div class="loading-step" id="lstep-2"><div class="loading-step-dot"></div><span>Calculando seus centros de energia…</span></div>
    <div class="loading-step" id="lstep-3"><div class="loading-step-dot"></div><span>Identificando canais e portões…</span></div>
    <div class="loading-step" id="lstep-4"><div class="loading-step-dot"></div><span>Determinando sua Autoridade…</span></div>
    <div class="loading-step" id="lstep-5"><div class="loading-step-dot"></div><span>Mapa pronto ✦</span></div>
  </div>
</div>

<!-- RESULTADO -->

<section id="result-section">

  <div class="result-hero">
    <p class="result-eyebrow result-reveal">Seu Desenho Humano</p>
    <h2 class="result-name-display result-reveal result-reveal-1" id="result-display-title">Você é uma<br/><em>—</em></h2>
    <div class="result-type-tag result-reveal result-reveal-2" id="result-type-tag-display">Tipo · Autoridade · Perfil</div>
  </div>

  <!-- Bodygraph com planetas e setas -->

  <div class="bodygraph-full-section result-reveal result-reveal-3">
    <p class="bodygraph-full-label">Seu gráfico Bodygraph</p>
    <div class="bodygraph-full-wrap">
      <div class="bodygraph-arrows" id="bodygraph-arrows" style="display:none;">
        <div class="arrow-pair">
          <div class="arrow-item design-color"><span class="arr" id="arrow-tl">→</span><span id="arrow-tl-label"></span></div>
          <div class="arrow-item design-color"><span class="arr" id="arrow-bl">→</span><span id="arrow-bl-label"></span></div>
        </div>
        <div class="arrow-pair">
          <div class="arrow-item personality-color"><span class="arr" id="arrow-tr">→</span><span id="arrow-tr-label"></span></div>
          <div class="arrow-item personality-color"><span class="arr" id="arrow-br">→</span><span id="arrow-br-label"></span></div>
        </div>
      </div>
      <div class="bodygraph-layout">
        <div class="planet-col design" id="planet-col-design"><div class="planet-col-label">Design</div></div>
        <div class="bodygraph-svg-col"><div id="bodygraph-svg-wrap"></div></div>
        <div class="planet-col personality" id="planet-col-personality"><div class="planet-col-label">Personalidade</div></div>
      </div>
    </div>
  </div>

  <!-- Portões, canais e cards com blur -->

  <div class="result-cards-section result-reveal result-reveal-4">
    <div class="gates-channels-wrap">
      <p class="gates-row-label">Portões Ativados</p>
      <div class="gates-tags" id="gates-tags"></div>
      <p class="gates-row-label">Canais Ativados</p>
      <div class="gates-tags" id="channels-tags"></div>
    </div>

```
<div class="info-cards-grid">
  <div class="info-card info-card-full">
    <p class="info-card-topic">Tipo</p>
    <p class="info-card-value" id="ic-tipo-valor">—</p>
    <p class="info-card-preview" id="ic-tipo-preview"></p>
    <div class="info-card-locked"><p class="info-card-locked-text" id="ic-tipo-locked"></p><div class="info-card-lock-bar"><span>🔒 desbloqueie para ler mais</span></div></div>
  </div>
  <div class="info-card">
    <p class="info-card-topic">Estratégia</p>
    <p class="info-card-value" id="ic-estrategia-valor">—</p>
    <p class="info-card-preview" id="ic-estrategia-preview"></p>
    <div class="info-card-locked"><p class="info-card-locked-text" id="ic-estrategia-locked"></p><div class="info-card-lock-bar"><span>🔒 desbloqueie para ler mais</span></div></div>
  </div>
  <div class="info-card">
    <p class="info-card-topic">Autoridade Interior</p>
    <p class="info-card-value" id="ic-autoridade-valor">—</p>
    <p class="info-card-preview" id="ic-autoridade-preview"></p>
    <div class="info-card-locked"><p class="info-card-locked-text" id="ic-autoridade-locked"></p><div class="info-card-lock-bar"><span>🔒 desbloqueie para ler mais</span></div></div>
  </div>
  <div class="info-card">
    <p class="info-card-topic">Perfil de Vida</p>
    <p class="info-card-value" id="ic-perfil-valor">—</p>
    <p class="info-card-preview" id="ic-perfil-preview"></p>
    <div class="info-card-locked"><p class="info-card-locked-text" id="ic-perfil-locked"></p><div class="info-card-lock-bar"><span>🔒 desbloqueie para ler mais</span></div></div>
  </div>
  <div class="info-card">
    <p class="info-card-topic">Definição</p>
    <p class="info-card-value" id="ic-definicao-valor">—</p>
    <p class="info-card-preview" id="ic-definicao-preview"></p>
    <div class="info-card-locked"><p class="info-card-locked-text" id="ic-definicao-locked"></p><div class="info-card-lock-bar"><span>🔒 desbloqueie para ler mais</span></div></div>
  </div>
  <div class="info-card">
    <p class="info-card-topic">Assinatura</p>
    <p class="info-card-value" id="ic-assinatura-valor">—</p>
    <p class="info-card-preview" id="ic-assinatura-preview"></p>
    <div class="info-card-locked"><p class="info-card-locked-text" id="ic-assinatura-locked"></p><div class="info-card-lock-bar"><span>🔒 desbloqueie para ler mais</span></div></div>
  </div>
  <div class="info-card info-card-full">
    <p class="info-card-topic">Cruz de Encarnação</p>
    <p class="info-card-value" id="ic-cruz-valor">—</p>
    <div class="info-card-locked"><p class="info-card-locked-text">Sua Cruz de Encarnação revela o propósito central da sua vida — o tema que atravessa todas as suas experiências e que, quando abraçado, traz profundo senso de significado. No PDF com mais de 60 páginas, você entende exatamente o que significa para sua carreira, relacionamentos e legado.</p><div class="info-card-lock-bar"><span>🔒 desbloqueie para ler mais</span></div></div>
  </div>
</div>
```

  </div>

  <div class="upsell-wrapper result-reveal result-reveal-5">
    <button class="upsell-btn" id="upsell-btn"><span>Quero desbloquear meu mapa completo →</span></button>
    <button class="upsell-skip" id="skip-btn">Não, prefiro ficar com o básico</button>
  </div>

</section>

<!-- O QUE É HD -->

<section class="what">
  <div>
    <p class="what-label reveal">O que é</p>
    <h2 class="what-title reveal reveal-delay-1">Desenho Humano é o mapa da sua essência</h2>
    <div class="what-body reveal reveal-delay-2">
      <p>Desenho Humano é um sistema que combina Astrologia, I Ching, Kabbalah e Física Quântica para revelar como você foi desenhada para operar no mundo.</p>
      <p>Com base na sua data, horário e local de nascimento, o gráfico mostra seus centros de energia, tipo, autoridade e estratégia de vida — um guia profundo para decisões mais alinhadas e menos desgastantes.</p>
      <p>Para mulheres que querem viver com mais propósito e clareza, é um ponto de partida transformador.</p>
    </div>
  </div>
  <div class="what-visual reveal reveal-delay-3"><div class="what-photo"><img src="/what-hd.jpg" alt="Mulher em conexão com sua essência" loading="lazy"/></div></div>
</section>

<!-- BENEFÍCIOS -->

<section class="benefits">
  <div class="benefits-inner">
    <p class="section-label-c reveal">O que você vai descobrir</p>
    <h2 class="section-title-c reveal reveal-delay-1">Seu gráfico revela</h2>
    <div class="benefits-grid">
      <div class="benefit-card reveal reveal-delay-1"><div class="benefit-icon">✦</div><h3 class="benefit-title">Seu Tipo</h3><p class="benefit-text">Manifestador, Gerador, Projetor ou Refletor — cada tipo tem uma estratégia de vida que, quando seguida, elimina resistência e aumenta fluxo.</p></div>
      <div class="benefit-card reveal reveal-delay-2"><div class="benefit-icon">◇</div><h3 class="benefit-title">Sua Autoridade</h3><p class="benefit-text">Como você foi desenhada para tomar decisões. Sacral, Emocional, Esplênico — cada autoridade tem seu ritmo e sinal único.</p></div>
      <div class="benefit-card reveal reveal-delay-3"><div class="benefit-icon">○</div><h3 class="benefit-title">Seus Centros</h3><p class="benefit-text">Onde está sua energia consistente e onde você absorve influências externas. Compreender isso muda como você usa — e preserva — sua energia.</p></div>
      <div class="benefit-card reveal reveal-delay-4"><div class="benefit-icon">△</div><h3 class="benefit-title">Seu Perfil</h3><p class="benefit-text">A combinação que revela seu papel no mundo e como você aprende, cresce e contribui com autenticidade ao longo da vida.</p></div>
      <div class="benefit-card reveal reveal-delay-1"><div class="benefit-icon">✧</div><h3 class="benefit-title">Seus Dons Naturais</h3><p class="benefit-text">As qualidades inatas que você carrega desde o nascimento — aquelas que parecem fáceis para você, mas impressionam as pessoas ao redor.</p></div>
      <div class="benefit-card reveal reveal-delay-2"><div class="benefit-icon">⬡</div><h3 class="benefit-title">Seus Talentos Únicos</h3><p class="benefit-text">Os talentos específicos moldados pela sua combinação de Gates e Canais — sua assinatura energética no mundo.</p></div>
    </div>
  </div>
</section>

<!-- DEPOIMENTOS -->

<section class="testimonials">
  <div style="max-width:900px;margin:0 auto;text-align:center;">
    <p class="section-label-c reveal" style="color:var(--roasted-peach);">O que dizem as mulheres</p>
    <h2 class="section-title-c reveal reveal-delay-1" style="color:var(--whole-wheat);margin-bottom:3.5rem;">Transformações reais</h2>
  </div>
  <div class="testimonials-grid">
    <div class="testimonial-card reveal reveal-delay-1"><div class="testimonial-stars">✦ ✦ ✦ ✦ ✦</div><p class="testimonial-text">Recebi meu mapa e fiquei impressionada com a precisão. Finalmente entendi por que me sinto tão diferente das pessoas ao meu redor — e aprendi a parar de me forçar a agir como elas.</p><div class="testimonial-author"><div class="testimonial-avatar">CM</div><div><div class="testimonial-name">Camila M.</div><div class="testimonial-role">São Paulo, SP</div></div></div></div>
    <div class="testimonial-card reveal reveal-delay-2"><div class="testimonial-stars">✦ ✦ ✦ ✦ ✦</div><p class="testimonial-text">O gráfico chegou lindo e super detalhado. Entender minha Autoridade Sacral mudou completamente a forma como tomo decisões no meu negócio. Recomendo de olhos fechados!</p><div class="testimonial-author"><div class="testimonial-avatar">RF</div><div><div class="testimonial-name">Rafaela F.</div><div class="testimonial-role">Belo Horizonte, MG</div></div></div></div>
    <div class="testimonial-card reveal reveal-delay-3"><div class="testimonial-stars">✦ ✦ ✦ ✦ ✦</div><p class="testimonial-text">Sempre tive dificuldade de me posicionar profissionalmente. Depois de entender meu Perfil e meu Tipo, tudo fez sentido. Parece que me deram um manual de instrução da minha própria vida.</p><div class="testimonial-author"><div class="testimonial-avatar">JL</div><div><div class="testimonial-name">Juliana L.</div><div class="testimonial-role">Curitiba, PR</div></div></div></div>
    <div class="testimonial-card reveal reveal-delay-4"><div class="testimonial-stars">✦ ✦ ✦ ✦ ✦</div><p class="testimonial-text">Nunca tinha ouvido falar em Desenho Humano antes. Recebi o mapa com o coração aberto e saí completamente diferente — com clareza sobre minha energia, meus limites e meu propósito. Foi um presente.</p><div class="testimonial-author"><div class="testimonial-avatar">TA</div><div><div class="testimonial-name">Tatiana A.</div><div class="testimonial-role">Fortaleza, CE</div></div></div></div>
    <div class="testimonial-card reveal reveal-delay-1"><div class="testimonial-stars">✦ ✦ ✦ ✦ ✦</div><p class="testimonial-text">Sou terapeuta, então já fiz MBTI, Eneagrama, tudo que existe. O Desenho Humano foi o único sistema que não só me descreveu — me mostrou o <em style="font-style:italic;color:var(--roasted-peach);">porquê</em> de cada padrão e o que fazer com isso.</p><div class="testimonial-author"><div class="testimonial-avatar">PS</div><div><div class="testimonial-name">Priscila S.</div><div class="testimonial-role">Florianópolis, SC</div></div></div></div>
    <div class="testimonial-card reveal reveal-delay-2"><div class="testimonial-stars">✦ ✦ ✦ ✦ ✦</div><p class="testimonial-text">Fiquei com medo de tentar porque não sabia meu horário exato. Coloquei um aproximado e o mapa ainda assim fez sentido absurdo. Vale tentar mesmo com a informação que você tem.</p><div class="testimonial-author"><div class="testimonial-avatar">BN</div><div><div class="testimonial-name">Beatriz N.</div><div class="testimonial-role">Recife, PE</div></div></div></div>
  </div>
</section>

<!-- FOOTER -->

<footer>
  <div class="footer-logo">
    <div style="width:44px;height:38px;display:flex;align-items:center;justify-content:center;"><svg fill="#9B7D61" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2000 2000"><path fill="none" d="M0 0L2000 0L2000 2000L0 2000L0 0Z"/><path d="M495.008 541.153C532.838 540.453 572.702 541.02 610.683 541.009L835.063 540.986L1456.93 541.046C1452.5 550.534 1441.44 568.389 1435.88 577.988L1396.86 645.615L1268.67 866.177L1077.79 1196.82C1052.94 1239.79 1026.8 1286.99 1001.12 1329.18L994.755 1318.27L1016.44 1280.76C1042.45 1233.01 1073.89 1182.25 1101.12 1134.79L1313.87 766.311L1388.74 636.178C1402.02 613.342 1425.51 575.523 1436.72 552.474L514.426 552.506C523.03 570.276 536.867 591.461 546.571 609.749L535.211 612.319C526.893 597.837 518.483 583.408 509.981 569.034C505.249 560.95 498.114 549.693 495.008 541.153Z"/><path d="M555.399 640.08C604.571 639.723 653.744 639.78 702.914 640.251L919.63 640.254L1358.05 639.898C1355.7 643.703 1353.11 647.593 1350.68 651.372C1316.3 652.596 1273.66 651.416 1238.76 651.4L1017.04 651.408L456.756 653.341C462.072 664.311 471.807 680.157 478.072 691.12L523.976 770.694L672.956 1028.47L844.102 1323.84L888.012 1400.27C895.624 1413.69 909.736 1439.81 918.442 1450.84C925.488 1441.64 944.045 1407.75 950.819 1395.92L957.106 1406.67C946.814 1425.98 929.942 1454.89 918.364 1473.23C912.509 1465.48 895.622 1434.5 889.821 1424.51L828.691 1319.39L638.202 989.146L494.516 741.641L456.968 677.577C451.239 667.791 441.618 652.376 437.434 642.357C462.149 641.127 489.779 642.684 514.806 641.958C529.622 641.528 540.135 642.556 555.399 640.08Z"/><path d="M1431.47 640.059C1457.67 639.918 1485.49 639.647 1511.61 640.344C1502.37 658.63 1486.3 684.696 1475.63 702.693L1431.35 779.026L1267.16 1062.6L1114.24 1327.39L1061.83 1417.41C1051.84 1434.75 1041.05 1455.34 1030.32 1471.88C1019.8 1455.81 1010.36 1436.09 1000.46 1419.42L897.1 1241.59L591.619 714.378C587.134 706.851 582.773 699.249 578.539 691.577L591.334 691.22L896.992 1219.93L982.889 1367.62C993.498 1386.15 1018.41 1433.32 1030.62 1449.27C1036.14 1441.63 1043.73 1427.37 1048.76 1418.81L1093.57 1340.95L1253.6 1064.06C1326.66 937.665 1400.05 811.451 1472.73 684.838C1478.97 673.957 1486.05 662.885 1491.21 651.488L1423.36 651.469C1425.67 647.521 1428 642.862 1431.47 640.059Z"/></svg></div>
    <span class="footer-logo-text">Vida Autoral</span>
  </div>
  <p>© 2026 Vida Autoral · Todos os direitos reservados</p>
</footer>

<script>
// TRADUÇÕES
var T={'Generator':'Gerador','Manifested Generator':'Gerador Manifestado','Manifesting Generator':'Geradora Manifestadora','Manifestor':'Manifestador','Projector':'Projetor','Reflector':'Refletora','To Respond':'Responder','To Inform':'Informar','To Initiate':'Iniciar','Wait for the Invitation':'Aguardar o Convite','Wait for a Lunar Cycle':'Aguardar Ciclo Lunar','Wait a Lunar Cycle':'Aguardar Ciclo Lunar','Sacral':'Sacral','Emotional':'Emocional','Emotional - Solar Plexus':'Emocional','Splenic':'Esplênica','Ego':'Ego','Self-Projected':'Projeção do Eu','Mental':'Mental','No Authority':'Sem Autoridade Interna','Lunar':'Lunar','Ego Manifestor':'Ego (Manifestador)','Single Definition':'Definição Única','Split Definition':'Definição Dividida','Triple Split Definition':'Tripla Divisão','Quadruple Split':'Quádrupla Divisão','No Definition':'Sem Definição','Satisfaction':'Satisfação','Success':'Sucesso','Peace':'Paz','Surprise':'Surpresa','Frustration':'Frustração','Bitterness':'Amargura','Anger':'Raiva','Disappointment':'Decepção'};
function tr(v){return(v&&T[v])||v||'—'}

// DESCRIÇÕES (preview visível + locked embaçado)
var DESCS={
  tipo:{
    preview:{'Generator':'Você é a força vital do mundo. Sua energia constrói, sustenta e inspira.','Manifested Generator':'Você é multipotencial com energia ágil — responde, inicia e avança rápido.','Manifesting Generator':'Você é multipotencial com energia ágil — responde, inicia e avança rápido.','Manifestor':'Você nasceu para iniciar movimentos e colocar coisas no mundo.','Projector':'Você veio para guiar. Sua visão de águia enxerga o que ninguém mais vê.','Reflector':'Você é o espelho do ambiente. Rara, sensível e profundamente sábia.'},
    locked:{'Generator':'Mas só quando seu corpo diz sim de verdade. "Na minha presença as pessoas se sentem elevadas e entusiasmadas. Elevo a energia das pessoas ao meu redor quando sigo o sim do meu corpo."','Manifested Generator':'Seu caminho não precisa ser linear para ser poderoso. "Na minha presença as pessoas se sentem elevadas e entusiasmadas. Tenho energia ágil e multipotencial para encontrar o caminho mais rápido ao resultado."','Manifesting Generator':'Seu caminho não precisa ser linear para ser poderoso. "Na minha presença as pessoas se sentem elevadas e entusiasmadas. Tenho energia ágil e multipotencial para encontrar o caminho mais rápido ao resultado."','Manifestor':'E tudo flui quando você age com coragem e informa antes. "Na minha presença as pessoas se sentem movidas a agir. Inicio movimentos na vida das pessoas ao meu redor quando sigo minhas próprias inspirações."','Projector':'E brilha quando é reconhecida e convidada. "Na minha presença as pessoas se sentem profundamente vistas e ouvidas. Sou uma guia poderosa que lê a energia das pessoas e dos ambientes."','Reflector':'E decide melhor com tempo e espaço. "Na minha presença as pessoas se veem como nunca antes. Reflito a energia das pessoas ao meu redor quando mantenho minha própria energia limpa."'}
  },
  estrategia:{
    preview:{'To Respond':'Não inicie — reaja. Quando algo de fora acende seu corpo, esse é o sinal.','To Inform':'Responda ao que vem de fora, depois avise quem será impactado.','To Initiate':'Antes de agir, avise quem será impactado.','Wait for the Invitation':'Sua orientação é valiosa demais para ser dada sem pedido.','Wait for a Lunar Cycle':'Decisões grandes pedem 28 dias.','Wait a Lunar Cycle':'Decisões grandes pedem 28 dias.'},
    locked:{'To Respond':'Forçar sem resposta esgota sua energia e cria frustração. O PDF explica como reconhecer sua resposta sacral em situações concretas de trabalho, relacionamento e dinheiro.','To Inform':'Pular um dos dois cria caos. O PDF detalha como aplicar essa estratégia em cada área da sua vida para eliminar resistência e aumentar seu impacto.','To Initiate':'Esse gesto simples transforma resistência em apoio. O PDF explica como informar sem pedir permissão — e por que isso muda tudo na sua vida.','Wait for the Invitation':'Espere ser reconhecida — então vá fundo. O PDF revela quais tipos de convite valem a pena e como criar condições para ser vista e chamada.','Wait for a Lunar Cycle':'Fale com pessoas diferentes, observe — a clareza vem com o tempo. O PDF explica como usar cada fase da lua para tomar decisões sem arrependimento.','Wait a Lunar Cycle':'Fale com pessoas diferentes, observe — a clareza vem com o tempo. O PDF explica como usar cada fase da lua para tomar decisões sem arrependimento.'}
  },
  autoridade:{
    preview:{'Sacral':'Sua bússola é o seu corpo. Um "hm-hm" interno significa sim; "uhn-uhn" significa não.','Emotional':'Nunca decida no pico da emoção. Sua clareza vem depois que a onda passa.','Emotional - Solar Plexus':'Nunca decida no pico da emoção. Sua clareza vem depois que a onda passa.','Splenic':'É um sussurro no momento presente. Você sabe, mas não sabe explicar por quê.','Ego':'Se não sai do coração de verdade, não vai até o fim.','Ego Manifestor':'Se não sai do coração de verdade, não vai até o fim.','Self-Projected':'Fale em voz alta com alguém neutro. A clareza vem ouvindo a própria voz.','Mental':'Você precisa de tempo e de ambientes diferentes para decidir.','No Authority':'Você precisa de tempo e de ambientes diferentes para decidir.','Lunar':'Decisões grandes pedem 28 dias de observação.'},
    locked:{'Sacral':'Confie sem precisar explicar. O PDF detalha como treinar essa escuta, por que você ignora essa voz — e como isso afeta suas decisões de carreira, dinheiro e amor.','Emotional':'Espere a névoa baixar. O PDF explica a onda emocional passo a passo e como saber quando você chegou na clareza para agir — sem perder oportunidades.','Emotional - Solar Plexus':'Espere a névoa baixar. O PDF explica a onda emocional passo a passo e como saber quando você chegou na clareza para agir — sem perder oportunidades.','Splenic':'Confie na primeira impressão. O PDF revela por que esse sinal some quando ignorado e como cultivar essa inteligência instantânea no dia a dia.','Ego':'Sua vontade genuína é o guia — não o dever. O PDF explica como distinguir o desejo real do condicionamento — e por que isso é a chave para prosperar.','Ego Manifestor':'Sua vontade genuína é o guia — não o dever. O PDF explica como distinguir o desejo real do condicionamento — e por que isso é a chave para prosperar.','Self-Projected':'Não pela mente pensante. O PDF mostra como criar conversas que geram clareza — e quem são as pessoas certas para esse processo na sua vida.','Mental':'Durma, observe, converse — depois escolha. O PDF explica como criar um processo de decisão que respeita seu design sem paralisar sua vida.','No Authority':'Durma, observe, converse — depois escolha. O PDF explica como criar um processo de decisão que respeita seu design sem paralisar sua vida.','Lunar':'Fale com pessoas diferentes, observe. O PDF revela como usar o ciclo lunar como calendário de decisões e como evitar comprometimentos prematuros.'}
  },
  perfil:{
    preview:{'1/3':'Você aprende estudando fundo e testando na prática — às vezes na marra.','1/4':'Base sólida de conhecimento + rede de confiança.','2/4':'Precisa de tempo a sós para recarregar, mas seus dons chamam as pessoas naturalmente.','2/5':'Você parece ter a solução que os outros precisam. Sua presença projeta liderança.','3/5':'Aprende pela tentativa e erro e vira referência por isso.','3/6':'Fase de experiências intensas → sabedoria compartilhada.','4/6':'Rede de relacionamentos de confiança + visão de longo prazo.','4/1':'Você influencia quem está perto com base sólida de conhecimento.','5/1':'As pessoas projetam em você a solução que precisam.','5/2':'Você tem genialidade natural e atrai projeções.','6/2':'Três fases: experimentação, observação, sabedoria.','6/3':'Você aprende tudo na prática — e essa vivência te transforma em referência.'},
    locked:{'1/3':'Cada erro é um dado valioso. O PDF detalha as três fases do seu perfil, como usá-las para criar autoridade — e por que seu caminho "não linear" é exatamente o certo para você.','1/4':'Você influencia quem já conhece. O PDF revela como cultivar sua rede corretamente, quais tipos de relacionamento te sustentam — e como transformar conhecimento em posicionamento.','2/4':'O PDF explica como equilibrar recolhimento e presença, por que você não precisa "se vender" — e como seus dons naturais atraem as oportunidades certas quando você para de forçar.','2/5':'Queira ou não. O PDF revela como gerenciar essas projeções, quando aceitá-las e quando proteger sua energia — e como usar essa visibilidade natural para seu propósito.','3/5':'Seu caminho não precisa ser linear. O PDF detalha por que suas "falhas" são dados, como construir reputação pelo experimento — e como sua história de vida se torna sua maior autoridade.','3/6':'Você vai se tornar um modelo de vida. O PDF explica as três fases do perfil 3/6, o que muda em cada uma — e como abraçar sua trajetória sem comparar com os outros.','4/6':'Você é o modelo que inspira pelo exemplo. O PDF revela as três fases do perfil 4/6, como sua rede é sua riqueza — e por que sua vida inteira é um processo de se tornar referência.','4/1':'Relacionamento é sua alavanca. O PDF detalha como construir sua base de conhecimento e rede de forma estratégica — e por que segurança interior é o pré-requisito para tudo.','5/1':'Sua preparação é o que sustenta essa expectativa. O PDF revela como gerenciar projeções, quando e como se mostrar — e como transformar essa "pressão" em impacto real.','5/2':'Hora de recolhimento é essencial para se renovar. O PDF explica como equilibrar visibilidade e privacidade, como seus dons emergem naturalmente — e como proteger sua energia.','6/2':'Com o tempo, você vira o modelo que outros seguem. O PDF detalha cada fase da sua vida, o que esperar de cada transição — e como abraçar o processo sem pressa.','6/3':'E essa vivência te transforma em referência autêntica. O PDF revela as fases do seu perfil, por que experimentar é seu caminho — e como sua história se torna autoridade.'}
  },
  definicao:{
    preview:{'Single Definition':'Você é consistente e previsível. Seu campo de energia é um bloco coeso.','Split Definition':'Você tem duas ilhas de energia. Certas pessoas naturalmente "completam" seu circuito.','Triple Split Definition':'Três blocos independentes. Você precisa de mais conexões para se sentir inteira.','Quadruple Split':'Quatro ilhas de energia. Você é muito adaptável ao ambiente e às pessoas.','No Definition':'Você é o espelho puro do coletivo. Sua energia é fluida.'},
    locked:{'Single Definition':'Menos impactado pelos outros. O PDF explica como usar essa consistência como vantagem — e por que você pode ser percebida como "inflexível" quando na verdade é autêntica.','Split Definition':'E você sente quando essa conexão acontece. O PDF revela quais tipos de pessoas completam seu circuito, como isso afeta suas decisões — e como evitar dependência energética.','Triple Split Definition':'E tudo bem. O PDF explica como navegar ambientes e relacionamentos com múltiplos blocos — e por que você precisa de mais variedade social do que a maioria.','Quadruple Split':'O contexto te molda muito. O PDF revela como escolher ambientes que amplificam seu melhor — e como reconhecer quando você está sendo influenciada de fora.','No Definition':'Escolher bem seu entorno é essencial. O PDF detalha como seu campo aberto funciona, o que você absorve e o que é genuinamente seu — e como tomar decisões sem contaminação.'}
  },
  assinatura:{
    preview:{'Satisfaction':'Quando você está alinhada, sente satisfação profunda no que faz.','Success':'Quando reconhecida e convidada, você prospera.','Peace':'Quando você avisa antes de agir, a resistência desaparece.','Surprise':'Quando alinhada, a vida te surpreende positivamente.'},
    locked:{'Satisfaction':'Não euforia, mas solidez interior. O PDF explica como reconhecer essa satisfação no dia a dia — e como usá-la como bússola para saber se você está no caminho certo.','Success':'O sucesso flui — não é forçado. O PDF revela como criar condições para ser reconhecida e convidada — e por que tentar forçar resultados bloqueia exatamente o que você quer.','Peace':'E tudo flui. O PDF detalha como cultivar essa paz como estado base — e como reconhecer quando você está fora do alinhamento antes que vire crise.','Surprise':'A surpresa é seu sinal de que está certa. O PDF explica como se abrir para o inesperado, por que planejar demais drena sua energia — e como confiar no processo.'}
  }
};

var PLANET_ORDER=['Sun','Earth','North Node','South Node','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];
var PLANET_SYM={'Sun':'☉','Earth':'⊕','North Node':'☊','South Node':'☋','Moon':'☽','Mercury':'☿','Venus':'♀','Mars':'♂','Jupiter':'♃','Saturn':'♄','Uranus':'♅','Neptune':'♆','Pluto':'♇'};

function traduzirCruz(v){if(!v)return'—';return v.replace('Right Angle Cross of','Cruz de Ângulo Reto de').replace('Left Angle Cross of','Cruz de Ângulo Esquerdo de').replace('Juxtaposition Cross of','Cruz de Justaposição de').replace('Right Angle Cross','Cruz de Ângulo Reto').replace('Left Angle Cross','Cruz de Ângulo Esquerdo').replace('Juxtaposition Cross','Cruz de Justaposição').replace(/ [Tt]he /g,' ').replace(/ [Oo]f /g,' da ')}

// REVEAL
var revealEls=document.querySelectorAll('.reveal');
var observer=new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target);}});},{threshold:.12});
revealEls.forEach(function(el){observer.observe(el);});

// TELEFONE
document.getElementById('telefone').addEventListener('input',function(){var v=this.value.replace(/\D/g,'').slice(0,11);if(v.length>6)this.value='('+v.slice(0,2)+') '+v.slice(2,7)+'-'+v.slice(7);else if(v.length>2)this.value='('+v.slice(0,2)+') '+v.slice(2);else if(v.length>0)this.value='('+v;});

// NAVEGAÇÃO
document.getElementById('next-btn').addEventListener('click',function(){
  var nome=document.getElementById('nome').value.trim();
  var email=document.getElementById('email').value.trim();
  var tel=document.getElementById('telefone').value.trim();
  if(!nome||!email||!tel){alert('Por favor, preencha todos os campos para continuar.');return;}
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){alert('Por favor, insira um e-mail válido.');return;}
  if(tel.replace(/\D/g,'').length<10){alert('Por favor, insira um WhatsApp válido.');return;}
  document.getElementById('step-1').style.display='none';
  document.getElementById('step-2').style.display='block';
  document.getElementById('step-2-greeting').textContent=nome.split(' ')[0]+', agora precisamos dos seus dados de nascimento ✨';
  document.querySelectorAll('#step-2 .reveal').forEach(function(el){setTimeout(function(){el.classList.add('visible');},100);});
  document.getElementById('formulario').scrollIntoView({behavior:'smooth',block:'start'});
});
document.getElementById('back-btn').addEventListener('click',function(){
  document.getElementById('step-2').style.display='none';
  document.getElementById('step-1').style.display='block';
  document.getElementById('formulario').scrollIntoView({behavior:'smooth',block:'start'});
});

// LOADING
function showLoadingOverlay(){
  var ov=document.getElementById('loading-overlay');ov.classList.add('active');document.body.style.overflow='hidden';
  ['lstep-1','lstep-2','lstep-3','lstep-4','lstep-5'].forEach(function(id,i){setTimeout(function(){var el=document.getElementById(id);el.classList.add('visible');setTimeout(function(){el.classList.add('done');},350);},i*700);});
}
function hideLoadingOverlay(){
  var ov=document.getElementById('loading-overlay');ov.style.opacity='0';ov.style.transition='opacity .5s ease';
  setTimeout(function(){ov.classList.remove('active');ov.style.opacity='';ov.style.transition='';document.body.style.overflow='';},500);
}

// POPULAR RESULTADO
function populateResult(apiData){
  var nome=document.getElementById('nome').value.trim();
  var firstName=nome.split(' ')[0];
  var props=(apiData&&apiData.properties)||{};
  var svgRaw=(apiData&&apiData.svg)||null;
  var portoes=(apiData&&apiData.portoes)||[];
  var canais=(apiData&&apiData.canais)||[];
  var planets=(apiData&&apiData.planets)||{};
  var variaveis=(apiData&&apiData.variaveis)||{};

  var tipoRaw=props.tipo||'';
  var estratRaw=props.estrategia||'';
  var autRaw=props.autoridade||'';
  var perfilRaw=(props.perfil||'').replace(/\s/g,'');
  var defRaw=props.definicao||'';
  var assRaw=props.assinatura||'';
  var cruzRaw=props.cruz||'';

  // Cabeçalho
  document.getElementById('result-display-title').innerHTML=firstName+', você é uma<br/><em>'+tr(tipoRaw)+'</em>';
  document.getElementById('result-type-tag-display').textContent=tr(tipoRaw)+' · '+tr(autRaw)+' · Perfil '+perfilRaw;

  // SVG
  var bgWrap=document.getElementById('bodygraph-svg-wrap');
  if(bgWrap){
    if(svgRaw){
      var svg=svgRaw.replace(/<svg([^>]*)>/i,function(m,attrs){attrs=attrs.replace(/\s+width\s*=\s*["'][^"']*["']/gi,'').replace(/\s+height\s*=\s*["'][^"']*["']/gi,'');return '<svg'+attrs+' style="width:100%;height:auto;display:block;">';});
      bgWrap.innerHTML=svg;
    } else {
      bgWrap.innerHTML='<div style="padding:3rem;text-align:center;color:var(--milky-coffee);font-size:.85rem;">Gráfico disponível no PDF enviado por e-mail ✦</div>';
    }
  }

  // Colunas de planetas
  var colD=document.getElementById('planet-col-design');
  var colP=document.getElementById('planet-col-personality');
  colD.innerHTML='<div class="planet-col-label">Design</div>';
  colP.innerHTML='<div class="planet-col-label">Personalidade</div>';
  var pers=(planets.personality)||{};
  var design=(planets.design)||{};
  PLANET_ORDER.forEach(function(name){
    var sym=PLANET_SYM[name]||'';
    var dVal=design[name]||'';var pVal=pers[name]||'';
    var dp=document.createElement('div');dp.className='planet-pill'+(dVal?'':' empty');dp.innerHTML='<span class="planet-sym">'+sym+'</span>'+(dVal?'<span class="planet-gate">'+dVal+'</span>':'');colD.appendChild(dp);
    var pp=document.createElement('div');pp.className='planet-pill'+(pVal?'':' empty');pp.innerHTML='<span class="planet-sym">'+sym+'</span>'+(pVal?'<span class="planet-gate">'+pVal+'</span>':'');colP.appendChild(pp);
  });

  // Setas
  if(variaveis&&(variaveis.tl||variaveis.tr)){
    document.getElementById('bodygraph-arrows').style.display='flex';
    var am={'left':'←','right':'→'};
    document.getElementById('arrow-tl').textContent=am[variaveis.tl]||'→';
    document.getElementById('arrow-bl').textContent=am[variaveis.bl]||'→';
    document.getElementById('arrow-tr').textContent=am[variaveis.tr]||'→';
    document.getElementById('arrow-br').textContent=am[variaveis.br]||'→';
    document.getElementById('arrow-tl-label').textContent=variaveis.tl_label||'';
    document.getElementById('arrow-bl-label').textContent=variaveis.bl_label||'';
    document.getElementById('arrow-tr-label').textContent=variaveis.tr_label||'';
    document.getElementById('arrow-br-label').textContent=variaveis.br_label||'';
  }

  // Portões e Canais
  var gw=document.getElementById('gates-tags');gw.innerHTML='';
  portoes.slice().sort(function(a,b){return a-b;}).forEach(function(g){var t=document.createElement('span');t.className='gate-tag';t.textContent=String(g);gw.appendChild(t);});
  var cw=document.getElementById('channels-tags');cw.innerHTML='';
  canais.forEach(function(c){var t=document.createElement('span');t.className='channel-tag';t.textContent=String(c);cw.appendChild(t);});

  // Cards
  function fillCard(idVal,idPreview,idLocked,catKey,rawKey,displayVal){
    document.getElementById(idVal).textContent=displayVal||tr(rawKey);
    var cat=DESCS[catKey]||{};
    document.getElementById(idPreview).textContent=(cat.preview&&cat.preview[rawKey])||'';
    document.getElementById(idLocked).textContent=(cat.locked&&cat.locked[rawKey])||'';
  }
  fillCard('ic-tipo-valor','ic-tipo-preview','ic-tipo-locked','tipo',tipoRaw,tr(tipoRaw));
  fillCard('ic-estrategia-valor','ic-estrategia-preview','ic-estrategia-locked','estrategia',estratRaw,tr(estratRaw));
  fillCard('ic-autoridade-valor','ic-autoridade-preview','ic-autoridade-locked','autoridade',autRaw,tr(autRaw));
  fillCard('ic-perfil-valor','ic-perfil-preview','ic-perfil-locked','perfil',perfilRaw,'Perfil '+perfilRaw);
  fillCard('ic-definicao-valor','ic-definicao-preview','ic-definicao-locked','definicao',defRaw,tr(defRaw));
  fillCard('ic-assinatura-valor','ic-assinatura-preview','ic-assinatura-locked','assinatura',assRaw,tr(assRaw));
  document.getElementById('ic-cruz-valor').textContent=traduzirCruz(cruzRaw);
}

function showResultSection(){
  var sec=document.getElementById('result-section');sec.classList.add('visible');
  setTimeout(function(){sec.scrollIntoView({behavior:'smooth',block:'start'});},100);
  setTimeout(function(){document.querySelectorAll('.result-reveal').forEach(function(el){el.classList.add('visible');});},300);
}

// SUBMIT
document.getElementById('hd-form').addEventListener('submit',async function(e){
  e.preventDefault();
  var nome=document.getElementById('nome').value.trim();
  var email=document.getElementById('email').value.trim();
  var tel=document.getElementById('telefone').value.trim();
  var data=document.getElementById('data').value;
  var hora=document.getElementById('hora').value;
  var local=document.getElementById('local').value.trim();
  if(!nome||!email||!tel||!data||!hora||!local){alert('Por favor, preencha todos os campos para gerar seu mapa.');return;}
  document.getElementById('submit-btn').disabled=true;
  document.getElementById('submit-label').textContent='Enviando…';
  showLoadingOverlay();
  document.getElementById('formulario').style.display='none';
  var apiData=null;
  try{
    var res=await fetch('/api/submit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({nome,email,telefone:tel,data,hora,local})});
    var json=await res.json();
    if(!res.ok)throw new Error(json.error||'Erro');
    // API deve retornar:
    // { ok, svg, properties:{tipo,estrategia,autoridade,perfil,definicao,assinatura,cruz},
    //   portoes:[], canais:[],
    //   planets:{ design:{Sun:"34.5",...}, personality:{Sun:"17.2",...} },
    //   variaveis:{ tl:"left", tr:"right", bl:"left", br:"right",
    //               tl_label:"Digestão", tr_label:"Perspectiva",
    //               bl_label:"Ambiente", br_label:"Consciência" } }
    apiData=json;
  }catch(err){console.error(err);}
  populateResult(apiData);
  setTimeout(function(){hideLoadingOverlay();setTimeout(showResultSection,600);},4000);
});

document.getElementById('upsell-btn').addEventListener('click',function(){window.location.href='https://vidaautoral.com.br/checkout-premium';});
document.getElementById('skip-btn').addEventListener('click',function(){window.location.href='https://dh.vidaautoral.com.br';});

// CITY AUTOCOMPLETE
(function(){
  var input=document.getElementById('local-input'),hidden=document.getElementById('local'),dropdown=document.getElementById('city-dropdown'),timer=null,selIdx=-1;
  input.addEventListener('input',function(){hidden.value='';input.classList.remove('city-selected');var q=this.value.trim();if(q.length<3){close();return;}clearTimeout(timer);timer=setTimeout(function(){fetch2(q);},350);});
  async function fetch2(q){try{var base='https://secure.geonames.org/searchJSON?name_startsWith='+encodeURIComponent(q)+'&featureClass=P&orderby=population&lang=pt&username=vidaautoral';var[r1,r2]=await Promise.all([fetch(base+'&maxRows=8&country=BR'),fetch(base+'&maxRows=8')]);var d1=await r1.json();var d2=await r2.json();var br=d1.geonames||[];var all=d2.geonames||[];var brIds=new Set(br.map(function(c){return c.geonameId;}));var intl=all.filter(function(c){return c.countryCode!=='BR'&&!brIds.has(c.geonameId);});var list=br.concat(intl.slice(0,Math.max(0,8-br.length)));if(!list.length){close();return;}render(list);}catch(e){close();}}
  function render(cities){dropdown.innerHTML='';selIdx=-1;cities.forEach(function(city){var li=document.createElement('li');var reg=city.adminName1?', '+city.adminName1:'';var disp=city.name+reg+' — '+city.countryName;li.innerHTML=city.name+'<span class="city-country">'+reg+' — '+city.countryName+'</span>';li.dataset.value=disp;li.dataset.cityName=city.name;li.addEventListener('click',function(){sel(disp,city.name);});dropdown.appendChild(li);});dropdown.classList.add('open');}
  function sel(disp,cityName){input.value=disp;hidden.value=cityName;input.classList.add('city-selected');close();}
  function close(){dropdown.classList.remove('open');dropdown.innerHTML='';selIdx=-1;}
  input.addEventListener('keydown',function(e){var items=dropdown.querySelectorAll('li');if(!items.length)return;if(e.key==='ArrowDown'){e.preventDefault();selIdx=Math.min(selIdx+1,items.length-1);upd(items);}else if(e.key==='ArrowUp'){e.preventDefault();selIdx=Math.max(selIdx-1,0);upd(items);}else if(e.key==='Enter'&&selIdx>=0){e.preventDefault();sel(items[selIdx].dataset.value,items[selIdx].dataset.cityName);}});
  function upd(items){items.forEach(function(li){li.classList.remove('active');});if(items[selIdx]){items[selIdx].classList.add('active');items[selIdx].scrollIntoView({block:'nearest'});}}
  document.addEventListener('click',function(e){if(!e.target.closest('.form-group'))close();});
  document.getElementById('hd-form').addEventListener('submit',function(e){if(!hidden.value){e.preventDefault();e.stopImmediatePropagation();input.focus();input.style.borderColor='#c0392b';input.setAttribute('placeholder','Selecione uma cidade da lista');setTimeout(function(){input.style.borderColor='';input.setAttribute('placeholder','Comece a digitar sua cidade…');},3000);}},true);
})();
</script>

</body>
</html>