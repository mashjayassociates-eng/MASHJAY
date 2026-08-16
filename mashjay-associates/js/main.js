(function(){
  "use strict";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- topbar scroll state ---------- */
  var topbar = document.querySelector(".topbar");
  function onScroll(){
    if(!topbar) return;
    topbar.classList.toggle("is-scrolled", window.scrollY > 12);
  }
  document.addEventListener("scroll", onScroll, { passive:true });
  onScroll();

  /* ---------- sliding nav indicator (layoutId-style) ---------- */
  var nav = document.querySelector(".nav-desktop");
  var indicator = document.querySelector(".nav-indicator");
  function placeIndicator(el){
    if(!el || !indicator || !nav) return;
    var navRect = nav.getBoundingClientRect();
    var r = el.getBoundingClientRect();
    indicator.style.width = r.width + "px";
    indicator.style.transform = "translate(" + (r.left - navRect.left) + "px,-50%)";
  }
  if(nav){
    var active = nav.querySelector("a.active");
    var links = nav.querySelectorAll("a");
    requestAnimationFrame(function(){ placeIndicator(active || links[0]); });
    links.forEach(function(a){
      a.addEventListener("mouseenter", function(){ placeIndicator(a); });
    });
    nav.addEventListener("mouseleave", function(){ placeIndicator(active || links[0]); });
    window.addEventListener("resize", function(){ placeIndicator(active || links[0]); });
  }

  /* ---------- mobile menu ---------- */
  var burger = document.querySelector(".burger");
  var mobileNav = document.querySelector(".nav-mobile");
  if(burger && mobileNav){
    burger.addEventListener("click", function(){
      var open = mobileNav.classList.toggle("open");
      burger.setAttribute("aria-expanded", open ? "true":"false");
      document.body.style.overflow = open ? "hidden" : "";
    });
    mobileNav.querySelectorAll("a").forEach(function(a){
      a.addEventListener("click", function(){ mobileNav.classList.remove("open"); document.body.style.overflow=""; });
    });
  }

  /* ---------- hero ready (load sequence) ---------- */
  var hero = document.querySelector(".hero");
  if(hero){ requestAnimationFrame(function(){ setTimeout(function(){ hero.classList.add("is-ready"); }, 60); }); }

  /* ---------- scroll reveal (whileInView) ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if("IntersectionObserver" in window && !reduceMotion){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function(el, i){
      el.style.setProperty("--i", (i % 6));
      io.observe(el);
    });
    // stagger children of grids automatically
    document.querySelectorAll(".stagger").forEach(function(group){
      Array.prototype.forEach.call(group.children, function(child, i){
        child.classList.add("reveal");
        child.style.setProperty("--i", i);
        io.observe(child);
      });
    });
  } else {
    revealEls.forEach(function(el){ el.classList.add("in"); });
  }

  /* ---------- animated counters ---------- */
  /* Note: every [data-count] element already contains its correct final
     number as static text in the HTML, so the page is 100% correct with
     zero JavaScript. If JS + IntersectionObserver are available, we briefly
     zero it out and animate up to that same number for polish only. */
  var counters = document.querySelectorAll("[data-count]");
  function animateCount(el){
    var target = parseFloat(el.getAttribute("data-count"));
    var decimals = (el.getAttribute("data-count").split(".")[1] || "").length;
    var dur = 1400, start = null;
    function tick(ts){
      if(!start) start = ts;
      var p = Math.min(1, (ts - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      el.textContent = (target * eased).toFixed(decimals);
      if(p < 1) requestAnimationFrame(tick);
      else el.textContent = target.toFixed(decimals);
    }
    requestAnimationFrame(tick);
  }
  if("IntersectionObserver" in window && !reduceMotion){
    var cio = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){
          e.target.textContent = "0";
          animateCount(e.target);
          cio.unobserve(e.target);
        }
      });
    }, { threshold: .6 });
    counters.forEach(function(c){ cio.observe(c); });
  }

  /* ---------- magnetic buttons ---------- */
  if(!reduceMotion && matchMedia("(hover:hover)").matches){
    document.querySelectorAll(".btn, .nav-cta").forEach(function(btn){
      btn.addEventListener("mousemove", function(e){
        var r = btn.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width/2) * 0.28;
        var y = (e.clientY - r.top - r.height/2) * 0.5;
        btn.style.transform = "translate(" + x + "px," + y + "px)";
      });
      btn.addEventListener("mouseleave", function(){ btn.style.transform = ""; });
    });
  }

  /* ---------- service card cursor glow ---------- */
  document.querySelectorAll(".service-card").forEach(function(card){
    card.addEventListener("mousemove", function(e){
      var r = card.getBoundingClientRect();
      card.style.setProperty("--mx", (e.clientX - r.left) + "px");
      card.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });

  /* ---------- ambient grid parallax ---------- */
  var grid = document.querySelector(".blueprint-grid");
  if(grid && !reduceMotion && matchMedia("(hover:hover)").matches){
    window.addEventListener("mousemove", function(e){
      var x = (e.clientX / window.innerWidth - 0.5) * 14;
      var y = (e.clientY / window.innerHeight - 0.5) * 14;
      grid.style.transform = "translate(" + x + "px," + y + "px)";
    });
  }

  /* ---------- page transitions for internal links ---------- */
  if(!reduceMotion){
    document.body.classList.add("page-transition");
    document.querySelectorAll('a[href$=".html"], a[href="/"], a[href="index.html"]').forEach(function(a){
      if(a.hostname !== window.location.hostname) return;
      a.addEventListener("click", function(e){
        var href = a.getAttribute("href");
        if(!href || href.startsWith("#")) return;
        e.preventDefault();
        document.body.classList.add("leaving");
        setTimeout(function(){ window.location.href = href; }, 380);
      });
    });
  }
})();
