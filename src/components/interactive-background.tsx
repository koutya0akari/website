export function InteractiveBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-y-0 left-[72px] w-px bg-[var(--notebook-margin)]" />
      <div className="absolute inset-y-0 left-[78px] w-px bg-[var(--notebook-margin)] opacity-35" />
      <div className="absolute inset-0 opacity-60 [background-image:repeating-linear-gradient(0deg,transparent_0_31px,var(--notebook-line)_31px_32px)]" />
      <div className="absolute left-5 top-8 hidden h-[calc(100%-4rem)] w-3 bg-[radial-gradient(circle,rgba(255,255,255,0.28)_0_3px,rgba(0,0,0,0.34)_4px_6px,transparent_7px)] bg-[length:12px_84px] sm:block" />
      <svg
        className="absolute right-[4vw] top-[12vh] hidden h-[34rem] w-[34rem] rotate-[-4deg] text-white/[0.06] lg:block"
        viewBox="0 0 520 520"
        fill="none"
      >
        <defs>
          <marker id="grr-arrow" markerHeight="8" markerWidth="8" orient="auto" refX="7" refY="4">
            <path d="M0 0 L8 4 L0 8 Z" fill="currentColor" />
          </marker>
        </defs>
        <rect x="74" y="104" width="372" height="286" rx="18" stroke="currentColor" strokeWidth="1.5" />
        <path d="M154 170 H356" stroke="currentColor" strokeWidth="2" markerEnd="url(#grr-arrow)" />
        <path d="M154 304 H356" stroke="currentColor" strokeWidth="2" markerEnd="url(#grr-arrow)" />
        <path d="M130 196 V282" stroke="currentColor" strokeWidth="2" markerEnd="url(#grr-arrow)" />
        <path d="M386 196 V282" stroke="currentColor" strokeWidth="2" markerEnd="url(#grr-arrow)" />
        <text x="98" y="176" fill="currentColor" fontSize="26" fontFamily="serif">
          K<tspan baselineShift="sub" fontSize="15">0</tspan>(X)
        </text>
        <text x="360" y="176" fill="currentColor" fontSize="26" fontFamily="serif">
          A<tspan baselineShift="super" fontSize="15">*</tspan>(X)
        </text>
        <text x="98" y="316" fill="currentColor" fontSize="26" fontFamily="serif">
          K<tspan baselineShift="sub" fontSize="15">0</tspan>(Y)
        </text>
        <text x="360" y="316" fill="currentColor" fontSize="26" fontFamily="serif">
          A<tspan baselineShift="super" fontSize="15">*</tspan>(Y)
        </text>
        <text x="198" y="150" fill="currentColor" fontSize="18" fontFamily="serif">
          ch(-) td(X)
        </text>
        <text x="198" y="344" fill="currentColor" fontSize="18" fontFamily="serif">
          ch(-) td(Y)
        </text>
        <text x="84" y="250" fill="currentColor" fontSize="20" fontFamily="serif">
          f!
        </text>
        <text x="410" y="250" fill="currentColor" fontSize="20" fontFamily="serif">
          f*
        </text>
        <path
          d="M168 406 C218 438 304 438 354 406"
          stroke="currentColor"
          strokeDasharray="6 9"
          strokeWidth="1.5"
        />
      </svg>
      <svg
        className="absolute bottom-[8vh] left-[9vw] hidden h-[24rem] w-[24rem] rotate-[3deg] text-white/[0.06] xl:block"
        viewBox="0 0 420 420"
        fill="none"
      >
        <defs>
          <marker id="kan-arrow" markerHeight="8" markerWidth="8" orient="auto" refX="7" refY="4">
            <path d="M0 0 L8 4 L0 8 Z" fill="currentColor" />
          </marker>
          <marker id="kan-dashed-arrow" markerHeight="8" markerWidth="8" orient="auto" refX="7" refY="4">
            <path d="M0 0 L8 4 L0 8 Z" fill="currentColor" />
          </marker>
        </defs>
        <path d="M112 278 H292" stroke="currentColor" strokeWidth="2" markerEnd="url(#kan-arrow)" />
        <path d="M112 278 V112" stroke="currentColor" strokeWidth="2" markerEnd="url(#kan-arrow)" />
        <path d="M116 108 C176 176 226 206 294 272" stroke="currentColor" strokeDasharray="7 8" strokeWidth="2" markerEnd="url(#kan-dashed-arrow)" />
        <text x="90" y="318" fill="currentColor" fontSize="34" fontFamily="serif">
          C
        </text>
        <text x="302" y="318" fill="currentColor" fontSize="34" fontFamily="serif">
          D
        </text>
        <text x="88" y="106" fill="currentColor" fontSize="34" fontFamily="serif">
          E
        </text>
        <text x="196" y="262" fill="currentColor" fontSize="19" fontFamily="serif">
          F
        </text>
        <text x="70" y="204" fill="currentColor" fontSize="19" fontFamily="serif">
          K
        </text>
        <text x="206" y="194" fill="currentColor" fontSize="19" fontFamily="serif">
          Lan<tspan baselineShift="sub" fontSize="12">K</tspan>F
        </text>
      </svg>
      <svg
        className="absolute left-[8vw] top-[5vh] hidden h-[29rem] w-[29rem] rotate-[2deg] text-white/[0.06] xl:block"
        viewBox="0 0 420 420"
        fill="none"
      >
        <defs>
          <marker id="pv-arrow" markerHeight="8" markerWidth="8" orient="auto" refX="7" refY="4">
            <path d="M0 0 L8 4 L0 8 Z" fill="currentColor" />
          </marker>
        </defs>
        <path d="M158 130 H268" stroke="currentColor" strokeWidth="2" markerEnd="url(#pv-arrow)" />
        <path d="M268 200 H158" stroke="currentColor" strokeWidth="2" markerEnd="url(#pv-arrow)" />
        <path d="M120 238 H300" stroke="currentColor" strokeDasharray="7 8" strokeWidth="1.7" />
        <text x="44" y="138" fill="currentColor" fontSize="23" fontFamily="serif">
          D<tspan baselineShift="super" fontSize="14">+</tspan>(k<tspan baselineShift="sub" fontSize="14">X</tspan>)
        </text>
        <text x="284" y="138" fill="currentColor" fontSize="23" fontFamily="serif">
          D<tspan baselineShift="super" fontSize="14">+</tspan>(k<tspan baselineShift="sub" fontSize="14">Y</tspan>)
        </text>
        <text x="44" y="208" fill="currentColor" fontSize="23" fontFamily="serif">
          D<tspan baselineShift="super" fontSize="14">+</tspan>(k<tspan baselineShift="sub" fontSize="14">X</tspan>)
        </text>
        <text x="284" y="208" fill="currentColor" fontSize="23" fontFamily="serif">
          D<tspan baselineShift="super" fontSize="14">+</tspan>(k<tspan baselineShift="sub" fontSize="14">Y</tspan>)
        </text>
        <text x="196" y="118" fill="currentColor" fontSize="17" fontFamily="serif">
          Rf<tspan baselineShift="sub" fontSize="11">!</tspan>
        </text>
        <text x="202" y="222" fill="currentColor" fontSize="17" fontFamily="serif">
          f<tspan baselineShift="super" fontSize="11">!</tspan>
        </text>
        <text x="22" y="286" fill="currentColor" fontSize="25" fontFamily="serif">
          RHom<tspan baselineShift="sub" fontSize="14">Y</tspan>(Rf<tspan baselineShift="sub" fontSize="14">!</tspan>F,G)
          <tspan dx="18" fontSize="28">≃</tspan>
          <tspan dx="18">RHom</tspan><tspan baselineShift="sub" fontSize="14">X</tspan>(F,f<tspan baselineShift="super" fontSize="14">!</tspan>G)
        </text>
      </svg>
    </div>
  );
}
