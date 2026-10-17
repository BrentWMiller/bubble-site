(() => {
  if (customElements.get('orb-particles')) return;
  const QVS = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;
  const QFS = `precision highp float;
uniform vec2 uRes,uProg;uniform float uProgF,uPh,uScale,uGlow,uRing,uGlitch,uSpread,uDT,uRingLock,uMag,uPull,uPullA,uHov,uVox,uVoxPh,uListen,uEye,uLid,uShA,uShB,uShM;uniform vec2 uCur;uniform vec3 uC1,uC2,uC3,uHalo;
mat3 qry(float a){float c=cos(a),s=sin(a);return mat3(c,0.,-s,0.,1.,0.,s,0.,c);}
mat3 qrx(float a){float c=cos(a),s=sin(a);return mat3(1.,0.,0.,0.,c,s,0.,-s,c);}
void pl(float v,inout float m1,inout float m2){if(v>m1){m2=m1;m1=v;}else if(v>m2){m2=v;}}
vec2 solid(vec3 p,float k){
  float m1=-1e3,m2=-1e3;
  if(k<6.5)return vec2(length(p)-1.,-1e3);
  if(k<7.5){vec3 a=abs(p)-vec3(.75);pl(a.x,m1,m2);pl(a.y,m1,m2);pl(a.z,m1,m2);return vec2(m1,m2);}
  if(k<8.5){pl(-p.y-.6,m1,m2);pl(dot(p,vec3(.8464,.5329,0.))-.3997,m1,m2);pl(dot(p,vec3(-.8464,.5329,0.))-.3997,m1,m2);pl(dot(p,vec3(0.,.5329,.8464))-.3997,m1,m2);pl(dot(p,vec3(0.,.5329,-.8464))-.3997,m1,m2);return vec2(m1,m2);}
  if(k<9.5){vec3 a=abs(p);float s=a.x+a.y+a.z,mn=min(a.x,min(a.y,a.z));return vec2((s-.95)*.57735,(s-2.*mn-.95)*.57735);}
  if(k<10.5){float d=.4157;pl(dot(p,vec3(-.57735,-.57735,-.57735))-d,m1,m2);pl(dot(p,vec3(-.57735,.57735,.57735))-d,m1,m2);pl(dot(p,vec3(.57735,-.57735,.57735))-d,m1,m2);pl(dot(p,vec3(.57735,.57735,-.57735))-d,m1,m2);return vec2(m1,m2);}
  vec2 q=vec2(length(p.xz)-.693,p.y);return vec2(length(q)-.315,-1e3);
}
float scn(vec3 p){return mix(solid(p,uShA).x,solid(p,uShB).x,uShM);}
void main(){
  vec2 uv=(gl_FragCoord.xy-.5*uRes)/uRes.y;
  float R=.3*uScale;vec2 uvE=uv*vec2(1.,1./max(.04,mix(1.,.62*uLid,uEye)));float r=length(uvE);float a=atan(uvE.y,uvE.x);
  float k=.5+.5*sin(a+uPh*.9);float k2=.5+.5*sin(a*2.-uPh*.6+1.3);
  vec3 rc=mix(mix(uC1,uC2,k),uC3,k2*.6);
  rc=mix(rc,vec3(.6,.85,1.),uListen*.4);
  float w=.016+.01*sin(a*3.+uPh);
  float gap=step(.7,fract(sin(floor(a*6.+uPh*4.)*57.3)*913.1));
  w*=1.-uGlitch*gap*.7;
  float bul=uPull*.3*pow(max(cos(a-uPullA),0.),18.);
  vec2 cu=uCur*.5;
  bul+=uVox*(.035*sin(a*5.+uVoxPh*1.3)+.02*sin(a*9.-uVoxPh*2.1))*(1.-uListen)-uListen*uVox*.03;
  bul+=uHov*.09*pow(max(cos(a-atan(cu.y,cu.x)),0.),6.)*smoothstep(0.,R,length(cu));
  float ring=exp(-pow((r-R*(1.02+bul))/w,2.));
  float fuzz=exp(-pow((r-R*(1.05+bul))/(w*2.6),2.))*.45;
  float sol=mix(step(6.5,uShA),step(6.5,uShB),uShM);
  float sHit=0.,sO=0.;
  if(sol>.001){
    float kk=.3*uScale;
    vec3 ro=vec3(0.,0.,5.5556),rd=normalize(vec3(uv/kk,-5.5556));
    mat3 Mi=qry(-uPh*.35)*qrx(-.35);
    ro=Mi*ro;rd=Mi*rd;
    float t=3.2,dmin=1e3;vec3 hp=ro;
    for(int i=0;i<56;i++){hp=ro+rd*t;float d=scn(hp);dmin=min(dmin,d);if(d<.0025){sHit=1.;break;}t+=max(d*.85,.004);if(t>8.5)break;}
    float sRing;
    if(sHit>.5){
      vec2 e=vec2(.004,0.);
      vec3 n=normalize(vec3(scn(hp+e.xyy)-scn(hp-e.xyy),scn(hp+e.yxy)-scn(hp-e.yxy),scn(hp+e.yyx)-scn(hp-e.yyx)));
      float fres=pow(1.-abs(dot(n,rd)),3.);
      float edge=mix(exp(-abs(solid(hp,uShA).y)/.028),exp(-abs(solid(hp,uShB).y)/.028),uShM);
      sRing=fres*.55+edge*1.1+.04;
    } else sRing=exp(-pow(dmin/.03,2.))*1.2;
    sO=sHit>.5?0.:dmin*kk;
    ring=mix(ring,sRing,sol);fuzz=mix(fuzz,(sHit>.5?0.:exp(-dmin/.09))*.35,sol);
  }
  float pg=0.;
  if(uProg.y>.5){float pan=fract(.25-a/6.2832),N=uProg.y,sg=floor(pan*N),fr=fract(pan*N);float gw=clamp(.012*N/.3,.03,.18);float gm=N>1.5?smoothstep(0.,gw,fr)*smoothstep(1.,1.-gw,fr):1.;float tr=exp(-pow((r-R*1.26)/.007,2.));float fl=step(sg+.5,uProg.x);float nw=step(abs(sg-(uProg.x-1.)),.5)*step(0.,uProgF)*exp(-uProgF*2.);pg=tr*gm*(mix(.2,1.,fl)+nw*1.6);}
  float hl=pow(.5+.5*cos(a-uPh*.8-1.2),5.);
  float lockHead=0.;
  if(uRingLock>.5&&uDT>=0.&&uDT<1.9){
    float an=fract(.25-a/6.2832);
    float pr=smoothstep(.05,.9,uDT);
    float msk=smoothstep(pr+.006,pr-.006,an);
    ring*=msk;fuzz*=msk;
    lockHead=exp(-pow((an-pr)/.018,2.))*step(uDT,.95)*exp(-pow((r-R*1.02)/.03,2.));
    float gp=fract((uDT-.95)*1.1);
    lockHead+=step(.95,uDT)*(1.-smoothstep(.95,1.85,uDT))*exp(-pow((an-gp)/.035,2.))*exp(-pow((r-R*1.02)/.02,2.))*1.5;
  }
  vec3 col=rc*(ring*(.55+1.6*hl)+fuzz*(.4+hl))*uRing;
  col+=vec3(1.)*ring*hl*hl*.6*uRing;
  col+=rc*ring*abs(bul)*5.*uRing;
  col+=uHalo*uHov*.5*exp(-dot(uv-cu,uv-cu)*60.)*smoothstep(R*.6,R*1.1,r);
  col+=rc*ring*uHov*.5;
  col+=rc*ring*uVox*.9;
  col+=uHalo*uVox*.35*smoothstep(R*.6,R*1.05,r)*exp(-max(r-R,0.)*6.);
  col+=vec3(1.,.97,.95)*lockHead*1.6;
  float o=mix(max(r-R,0.),sO,sol);
  col+=uHalo*uGlow*(exp(-o*7./uSpread)*.55+exp(-o*22./uSpread)*.5)*mix(smoothstep(R*.7,R*1.02,r),1.-sHit,sol);
  col+=uHalo*uGlow*.12*mix(smoothstep(R,0.,r),sHit,sol);
  if(uDT>=0.){
    float g=smoothstep(0.,.38,uDT)*(1.-smoothstep(.38,.46,uDT));
    col+=rc*ring*g*1.4*uMag;
    float l1=max(uDT-.42,0.)/1.1,l2=max(uDT-.6,0.)/1.5;
    float e1=1.-pow(1.-clamp(l1,0.,1.),3.),e2=1.-pow(1.-clamp(l2,0.,1.),3.);
    vec3 off=vec3(.007,0.,-.007);
    vec3 d1=(vec3(r)-(R*(1.02+e1*.5)+off*e1))/(.006+.012*e1);
    vec3 d2=(vec3(r)-(R*(1.02+e2*.36)+off*e2))/(.004+.01*e2);
    float a1=step(.42,uDT)*pow(1.-clamp(l1,0.,1.),1.6)*mix(.35,1.,uMag),a2=step(.6,uDT)*pow(1.-clamp(l2,0.,1.),1.6)*.6*step(.5,uMag);
    col+=exp(-d1*d1)*a1*1.3+exp(-d2*d2)*a2;
    float fl=step(.42,uDT)*exp(-(uDT-.42)*3.);
    col+=vec3(1.,.97,.95)*fl*.35*smoothstep(R*1.3,0.,r)*uMag;
  }
  col+=mix(rc,vec3(1.),.55)*pg*1.4;
  col*=smoothstep(.5,.36,r);
  col=1.-exp(-col*1.4);
  gl_FragColor=vec4(col,max(col.r,max(col.g,col.b)));
}`;
  const PVS = `attribute vec3 pos;
uniform float uSettle,uSat,uFail,uSkill,uBase,uWork,uWorkB,uWorkM,uSub,uBoil,uPh,uWave,uScale,uPt,uGlitch,uFill,uWF,uWS,uChop,uDT,uBright,uCon,uEmber,uImpl,uBloom,uMag,uPull,uPullA,uHov,uVox,uVoxPh,uListen,uEye,uLid,uPupil,uEyeMode,uShA,uShB,uShM;uniform vec2 uCur,uLook;uniform vec3 uVoxB;
uniform vec3 uC1,uC2,uC3,uFillC;
uniform vec3 uRings,uTicks,uTickA;
varying vec3 vC;varying float vSoft;
float hs(vec3 v){return fract(sin(dot(v,vec3(12.9898,78.233,37.719)))*43758.5453);}
mat3 ry(float a){float c=cos(a),s=sin(a);return mat3(c,0.,-s,0.,1.,0.,s,0.,c);}
float rpl(vec3 q,vec3 s,float pa){float an=acos(clamp(dot(q,normalize(s)),-1.,1.));return pow(max(sin(an*7.-pa*3.5),0.),3.)*1.7*exp(-an*.45);}
float bn(vec3 b,float pa){return sin(b.x+pa*1.1)*sin(b.y*1.2-pa*.8)*sin(b.z*.9+pa*.95)+.5*sin(b.x*2.1-pa*1.5+b.z*1.4)*sin(b.y*1.9+pa);}
mat3 rx(float a){float c=cos(a),s=sin(a);return mat3(1.,0.,0.,0.,c,s,0.,-s,c);}
vec3 shp(vec3 q,float k){
  if(k<.5)return q;
  if(k<1.5){float n=sin(q.x*2.7+uPh*.7)*sin(q.y*3.1-uPh*.5)*sin(q.z*2.3+uPh*.6);float n2=sin(q.x*5.1-uPh*.9+q.z*2.)*.5;return q*(1.+.26*n+.06*n2);}
  if(k<2.5){float th=atan(q.z,q.x),ph=q.y*3.14159;float rr=.66+.3*cos(ph);return vec3(rr*cos(th),.3*sin(ph),rr*sin(th))*1.05;}
  if(k<3.5){vec3 a=abs(q);float m=max(a.x,max(a.y,a.z));return mix(q*.95,q/m*.72,.88);}
  if(k<4.5){float h1=hs(q*7.1),h2=hs(q.zxy*3.3);float rr=pow(h1,.55)*1.05;float arm=step(.5,h2);float ang=arm*3.14159+rr*4.2+(hs(q.yzx)-.5)*.55;float thick=(hs(q*1.7)-.5)*.09*(1.25-rr);return vec3(cos(ang)*rr,thick,sin(ang)*rr);}
  if(k<5.5){float h=hs(q*5.3);if(h>.6){float rr=.8+(hs(q.zyx)-.5)*.5;float th=atan(q.z,q.x);return vec3(cos(th)*rr,(hs(q.yxz)-.5)*.02,sin(th)*rr);}return q*.52;}
  if(k>10.5){float th=atan(q.z,q.x),ph=q.y*3.14159;float rr=.66+.3*cos(ph);return vec3(rr*cos(th),.3*sin(ph),rr*sin(th))*1.05;}
  if(k>9.5){float t=1e3,nd,d=.4157;
    nd=dot(q,vec3(-.57735,-.57735,-.57735));if(nd>.001)t=min(t,d/nd);
    nd=dot(q,vec3(-.57735,.57735,.57735));if(nd>.001)t=min(t,d/nd);
    nd=dot(q,vec3(.57735,-.57735,.57735));if(nd>.001)t=min(t,d/nd);
    nd=dot(q,vec3(.57735,.57735,-.57735));if(nd>.001)t=min(t,d/nd);
    return q*t;}
  if(k>8.5){return q/(abs(q.x)+abs(q.y)+abs(q.z))*.95;}
  if(k>7.5){float t=1e3,nd;
    nd=-q.y;if(nd>.001)t=min(t,.6/nd);
    nd=dot(q,vec3(.8464,.5329,0.));if(nd>.001)t=min(t,.3997/nd);
    nd=dot(q,vec3(-.8464,.5329,0.));if(nd>.001)t=min(t,.3997/nd);
    nd=dot(q,vec3(0.,.5329,.8464));if(nd>.001)t=min(t,.3997/nd);
    nd=dot(q,vec3(0.,.5329,-.8464));if(nd>.001)t=min(t,.3997/nd);
    return q*t;}
  if(k>6.5){vec3 a=abs(q);return q/max(a.x,max(a.y,a.z))*.75;}
  float t=q.y,strand=step(0.,q.x),a=t*7.+strand*3.14159,jit=(hs(q)-.5)*.06;
  return vec3(cos(a)*(.36+jit),t*.95,sin(a)*(.36+jit));
}
float tiltOf(float k){return (k>3.5&&k<5.5)?.8:0.;}
vec3 gOff;
vec2 wkm(float m,vec3 q,vec3 pos,float pa,float wv0){float wv=wv0,wa=.07;
  if(m>.5){wv=0.;
    if(m<1.5){float y0=1.3-fract(pa*.2)*2.6;float d=q.y-y0;wv=exp(-d*d/.008)*1.6+step(0.,d)*exp(-d*5.)*.35;wa=.05;}
    else if(m<2.5){float an=acos(clamp(dot(q,normalize(vec3(.3,.35,.89))),-1.,1.));wv=pow(max(sin(an*7.-pa*3.5),0.),3.)*1.7*exp(-an*.45);wa=.08;}
    else if(m<3.5){wv=pow(.5+.5*sin(atan(pos.z,pos.x)*4.),6.)*1.6-.15;wa=.03;}
    else if(m<4.5){for(int i=0;i<3;i++){float fi=float(i);vec3 n=normalize(vec3(sin(fi*2.094+pa*.1),1.2*cos(fi*1.9+.4),cos(fi*2.094+pa*.1)));vec3 ax=normalize(cross(n,vec3(.31,.17,.93)));vec3 ay=cross(n,ax);float an=atan(dot(q,ay),dot(q,ax));float h=fract(pa*(.16+fi*.05)-an/6.2832);wv+=exp(-pow(dot(q,n)/.05,2.))*(.15+1.6*exp(-h*6.));}wa=.06;}
    else if(m<5.5){vec3 cl=floor(pos*2.6);float f=fract(pa*.32+hs(cl)*5.3+hs(pos)*.05);wv=step(.5,hs(cl+3.1))*exp(-f*8.)*(1.2+.8*hs(pos))-.08;wa=.12;}
    else{vec3 b=q*2.6;wv=(sin(b.x+pa*1.1)*sin(b.y*1.2-pa*.8)*sin(b.z*.9+pa*.95)+.5*sin(b.x*2.1-pa*1.5+b.z*1.4)*sin(b.y*1.9+pa))*1.5;wa=.11;}
    if(m>6.5){
      vec3 d1=normalize(vec3(.55,.8,.25));float fm=exp(-pow(dot(q,normalize(vec3(.3,-.2,.9)))-.55,2.)*5.);
      if(m<7.5){wv=pow(.5+.5*sin(dot(q,d1)*5.-pa*2.2),4.)*2.-.3;wa=.07;}
      else if(m<8.5){wv=(sin(dot(q,d1)*7.-pa*2.6)+sin(dot(q,normalize(vec3(-.6,.3,.7)))*6.-pa*2.2))*.75*fm;wa=.07;}
      else if(m<9.5){wv=rpl(q,vec3(sin(pa*.3)*.8,cos(pa*.23)*.5,.7),pa);wa=.08;}
      else if(m<10.5){float a1=acos(clamp(dot(q,normalize(vec3(.55,.3,.78))),-1.,1.)),a2=acos(clamp(dot(q,normalize(vec3(-.5,-.25,.83))),-1.,1.));wv=pow(max((sin(a1*7.-pa*3.5)+sin(a2*7.-pa*3.5))*.5,0.),2.)*1.9*exp(-(a1+a2)*.22);wa=.08;}
      else if(m<11.5){float an=acos(clamp(dot(q,normalize(vec3(.3,.35,.89))),-1.,1.));float ph=pa*3.5-an*7.;float k=floor(ph/6.2832);wv=pow(max(sin(-ph),0.),3.)*1.9*exp(-an*.45)*step(mod(k,4.),1.5);wa=.09;}
      else if(m<12.5){float h=fract(pa*.25-atan(q.z,q.x)/6.2832);wv=exp(-h*7.)*1.6+exp(-pow(h/.015,2.))*.6-.05;wa=.05;}
      else if(m<13.5){float y0=cos(pa*.6)*1.15,v=-sin(pa*.6),d=q.y-y0;wv=exp(-d*d/.008)*1.6+step(0.,-d*sign(v))*exp(-abs(d)*5.)*.4*abs(v);wa=.05;}
      else if(m<14.5){float yy=q.y*3.2+pa*.35,li=floor(yy),f=fract(yy);float wd=step(.3,hs(vec3(li,floor(atan(q.z,q.x)*3.5+li*1.7),2.)));wv=exp(-pow((f-.5)/.07,2.))*1.4*wd;wa=.04;}
      else if(m<15.5){vec3 b=q*3.;b.y-=pa*.7;wv=pow(max(bn(b,pa*.6),0.),1.5)*1.6-.1;wa=.08;}
      else if(m<16.5){float env=.5+.5*sin(dot(q,d1)*3.-pa*1.6);wv=bn(q*3.,pa)*1.7*env*env;wa=.1;}
      else{
        float fz=smoothstep(-.15,.35,q.z);
        if(m<17.5){float an=acos(clamp(dot(q,normalize(vec3(.3,.35,.89))),-1.,1.));wv=pow(max(sin(an*7.+pa*3.),0.),3.)*1.7*smoothstep(2.6,.15,an);wa=-.05;}
        else if(m<18.5){float ph=pa*.45,li=mod(floor(ph),4.),x0=fract(ph)*1.3-.65;vec3 v=normalize(vec3(x0,.42-li*.28,.8));float d=distance(q,v);wv=exp(-d*d/.012)*2.1+exp(-pow((q.y-v.y)/.04,2.))*smoothstep(x0-.5,x0,q.x)*step(q.x,x0)*.55*fz;wa=.06;}
        else if(m<19.5){vec3 c=normalize(vec3(sin(pa*.4)*.5,sin(pa*.27)*.35,.85));float d=distance(q,c);wv=(smoothstep(.42,.3,d)*1.1+exp(-pow((d-.37)/.03,2.))*1.3)*fz;wa=.1;}
        else if(m<20.5){for(int k=0;k<8;k++){float fk=float(k),tk=pa*.9-fk*.07;vec3 pt=normalize(vec3(.55*sin(tk*1.3),.35*sin(tk*2.1+.5),.8));float d=distance(q,pt);wv+=exp(-d*d/.005)*(1.-fk/8.)*(k==0?2.4:1.4);}wa=.08;}
        else if(m<21.5){float c=fract(pa*.1),sp=fract(c*7.),yl=-.9+(floor(c*7.)+smoothstep(0.,.25,sp))/7.*1.8;wv=(step(q.y,yl)*.4+exp(-pow((q.y-yl)/.035,2.))*1.6*(1.+exp(-sp*6.)))*fz;wa=.05;}
        else if(m<22.5){float ph=pa*.5,li=mod(floor(ph),4.),x0=floor(fract(ph)*10.)/10.*1.3-.65;
          for(int j=0;j<4;j++){float fj=float(j),yj=.42-fj*.28,gap=step(.25,hs(vec3(floor(q.x*9.),fj,3.)));float lw=fj<li?.4:(fj<li+.5?.95*step(q.x,x0):0.);wv+=exp(-pow((q.y-yj)/.04,2.))*lw*step(-.65,q.x)*gap*fz;
            if(fj>li-.5&&fj<li+.5){vec3 h=normalize(vec3(x0+.06,yj,.8));float d=distance(q,h);wv+=exp(-d*d/.004)*2.2*step(.5,fract(pa*2.));}}
          wa=.05;}
        else if(m<23.5){vec3 L=normalize(vec3(0.,.96,.28));float an=acos(clamp(dot(q,L),-1.,1.));wv=smoothstep(.75,0.,an)*1.1+pow(max(sin(an*9.+pa*4.),0.),4.)*smoothstep(1.6,.25,an)*1.5;wa=.13;}
        else if(m<24.5){wv=pow(.5+.5*sin(abs(q.y)*8.+pa*2.3),3.)*1.15-.15;wa=-.075;}
        else if(m<25.5){wv=.35*sin(dot(q,d1)*2.-pa*.5);wa=.03;}
        else if(m<26.5){float st=uSettle;float bo=bn(q*2.6,pa*.9)*1.5;vec3 b=q*3.;b.y-=pa*.7;float si=pow(max(bn(b,pa*.6),0.),1.5)*1.6-.1;wv=mix(bo,si,st)*(1.+.25*(1.-st));wa=mix(.1,.07,st);}
        else if(m<27.5){vec3 fr=normalize(vec3(.3,.35,.89));float an=acos(clamp(dot(q,fr),-1.,1.));vec3 ax=normalize(cross(fr,vec3(0.,1.,0.))),ay=cross(fr,ax);float th=atan(dot(q,ay),dot(q,ax));wv=pow(max(sin(an*6.+th*2.+pa*2.6),0.),3.)*1.6*smoothstep(2.7,.2,an);wa=-.06;}
        else if(m<28.5){float c=smoothstep(-.6,.9,sin(pa*.75));gOff=vec3(q.x*.07,-q.y*.24,q.z*.07)*c;wv=c*.6*pow(1.-abs(q.y),3.)-.1;wa=.02;}
        else if(m<29.5){float c=smoothstep(-.3,.9,sin(pa*.7));vec3 cc=normalize(floor(q*2.6)+.5);gOff=(cc-q)*.42*c;wv=c*.9-.15;wa=.0;}
        else{float c=.5+.5*sin(pa*.65);wv=-c+.7*c*pow(max(sin(q.y*11.+pa*1.6),0.),4.);wa=.12;}
      }
    }
  }
  return vec2(wv,wa);}
void main(){
  vec3 p=mix(shp(pos,uShA),shp(pos,uShB),uShM);
  float tw=uWave*.9*sin(p.y*3.2+uPh*1.3)*(1.-.9*mix(step(6.5,uShA),step(6.5,uShB),uShM))*mix(step(uWork,.5),step(uWorkB,.5),uWorkM)+mix(step(2.5,uWork)*step(uWork,3.5),step(2.5,uWorkB)*step(uWorkB,3.5),uWorkM)*uWave*(2.4*sin(uPh*.45)*p.y);
  p=ry(uPh*.35+tw)*p;
  float arg=dot(p,vec3(.55,.8,.25))*uWF-uPh*uWS;
  float wv=sin(arg);
  float sq=sign(wv)*pow(abs(wv),.25);
  float jit=hs(floor(pos*5.)+floor(uPh*8.));
  wv=mix(wv,sq*(.4+.9*jit),uChop);
  wv*=exp(-pow(dot(p,normalize(vec3(.3,-.2,.9)))-.55,2.)*5.);
  float wa=.07;
  vec3 q=normalize(p);float wv0=wv;
  gOff=vec3(0.);vec2 wkA=wkm(uWork,q,pos,uPh,wv);vec3 oA=gOff;
  if(uWorkM>.999){gOff=vec3(0.);wkA=wkm(uWorkB,q,pos,uPh,wv);oA=gOff;}
  else if(uWorkM>.001){gOff=vec3(0.);vec2 wkB=wkm(uWorkB,q,pos,uPh,wv);oA=mix(oA,gOff,uWorkM);wkA=mix(wkA,wkB,uWorkM);}
  wv=wkA.x;wa=wkA.y;
  float rAct=0.;for(int i=0;i<3;i++){float ag=uRings[i];if(ag>=0.&&ag<2.5)rAct=max(rAct,exp(-ag*1.2));}
  float duck=clamp(min(uSat,3.)*.15+min(uSub,3.)*.18+uBoil*.6+rAct*.45,0.,.65);wv*=1.-duck;
  float ly=0.;float fan=acos(clamp(dot(q,normalize(vec3(.3,.35,.89))),-1.,1.));
  for(int i=0;i<3;i++){float ag=uRings[i];if(ag>=0.&&ag<2.5){float rr=ag*1.6;ly+=(exp(-pow((fan-rr)/.17,2.))*2.6+exp(-pow((fan-rr+.22)/.1,2.))*.8)*exp(-ag*.75);}}
  for(int i=0;i<6;i++){float fi=float(i);float wg=clamp(uSub-fi,0.,1.);if(wg>0.){{vec3 sd=normalize(vec3(sin(fi*2.4+uPh*(.06+fi*.01))*.85,cos(fi*1.7+.6)*.6,.55));float an=acos(clamp(dot(q,sd),-1.,1.));ly+=pow(max(sin(an*5.-(uPh*(.55+fi*.04)+fi*1.3)*2.2),0.),2.)*.75*exp(-an*.6)*wg/(1.+.4*fi);}}}
  for(int i=0;i<3;i++){float ag=uTicks[i];if(ag>=0.&&ag<.8){ly+=exp(-pow((fan-ag*2.8)/.1,2.))*1.6*uTickA[i]*exp(-ag*4.);}}
  for(int i=0;i<6;i++){float fi=float(i);float wg=clamp(uSat-fi,0.,1.);if(wg>0.){vec3 n=normalize(vec3(sin(fi*2.4+.3),1.1*cos(fi*1.9+.4),cos(fi*2.4+.3)));vec3 ax=normalize(cross(n,vec3(.31,.17,.93)));vec3 ay=cross(n,ax);float an=atan(dot(q,ay),dot(q,ax));float h=fract(uPh*(.12+fi*.023)+fi*.37-an/6.2832);ly+=exp(-pow(dot(q,n)/.09,2.))*(exp(-pow(h/.035,2.))*3.+exp(-h*14.)*.8)*wg;}}
  if(uFail>=0.&&uFail<1.2){float dd=distance(q,normalize(vec3(-.45,.25,.86)));ly-=exp(-dd*dd/.04)*2.6*exp(-uFail*3.5);}
  if(uSkill>=0.&&uSkill<1.6){float sp=smoothstep(0.,1.4,uSkill);float sa=sp*3.1416;vec3 sn=normalize(vec3(cos(sa),.35,sin(sa)));ly+=exp(-pow(dot(q,sn)/.1,2.))*1.3*smoothstep(0.,.25,uSkill)*(1.-smoothstep(1.,1.6,uSkill));}
  if(uBoil>.001)ly+=bn(q*3.,uPh)*2.1*uBoil/(1.+.45*uSub);
  float bw=uBase*mix(step(.5,uWork),step(.5,uWorkB),uWorkM)*(1.-duck*.6);
  p*=1.+uWave*(wa*wv+.07*bw*wv0+.1*ly);p+=oA*uWave*length(p);wv+=ly+bw*wv0;
  float gh=hs(pos+floor(uPh*9.));
  float band=step(.82,fract(sin(floor((pos.y+uPh*.3)*9.)*91.7)*437.5));
  p*=1.+uGlitch*(gh*.1+band*.12);
  p.x+=uGlitch*band*.08*sign(gh-.5);
  float hasD=step(0.,uDT);
  float gather=hasD*smoothstep(0.,.38,uDT)*(1.-smoothstep(.38,.46,uDT));
  float ld=uDT-.42-(pos.y+1.)*.09;
  float lp=max(ld,0.);
  float on2=hasD*step(0.,ld);
  float spring=on2*exp(-lp*4.5)*sin(lp*13.+.2);
  float flash=on2*exp(-lp*3.2);
  gather*=uMag;spring*=mix(.35,1.,uMag)*(1.+uImpl*1.3);flash*=mix(.45,1.,uMag);
  p*=1.-mix(.14,.85,uImpl)*gather;
  p*=1.+spring*(.22+.3*hs(pos));
  float em=uEmber*step(.8,hs(pos.zxy))*on2;
  float ek=em*(1.-step(2.65,lp));
  p.y+=ek*lp*(.35+.4*hs(pos.yzx));
  p.x+=ek*sin(lp*2.+pos.z*6.)*.08*lp;
  float emFade=1.-em*(smoothstep(0.,2.4,lp)*(1.-smoothstep(2.65,3.4,lp)));
  float on=step(.01,uFill);
  float ys=p.y;
  float lvl=uFill*2.05-1.02+(.045*sin(p.x*5.+uPh*1.6)+.03*sin(p.z*7.-uPh*1.1))*on;
  float inside=smoothstep(lvl+.03,lvl-.03,ys)*on;
  float surf=exp(-pow((ys-lvl)/.03,2.))*on*step(uFill,.99);
  p=rx(.35+mix(tiltOf(uShA),tiltOf(uShB),uShM))*p;
  float th=acos(clamp(p.z,-1.,1.));
  float vrip=sin(th*6.-uVoxPh);
  float vlvl=uVox*(1.-th/3.3);
  p*=1.+uVox*.05*uVoxB.x+vrip*vlvl*.045;
  p+=(vec3(hs(pos.yzx),hs(pos.zxy),hs(pos))-.5)*uVoxB.z*.035;
  vec3 eLd=normalize(vec3(uLook.x*.45,uLook.y*.32,1.));
  vec3 eN=normalize(p);
  float eIc=dot(eN,eLd);
  vec3 eAx=normalize(cross(vec3(0.,1.,0.),eLd)),eAy=cross(eLd,eAx);
  float eLx=dot(eN,eAx),eLy=dot(eN,eAy);
  float eIrR=.4,eD=length(vec2(eLx,eLy)),eFront=step(0.,eIc);
  float m0=uEye*step(uEyeMode,.5),m1=uEye*step(.5,uEyeMode)*step(uEyeMode,1.5),m2=uEye*step(1.5,uEyeMode)*step(uEyeMode,2.5),m3=uEye*step(2.5,uEyeMode);
  float eIris=m0*smoothstep(eIrR+.02,eIrR-.05,eD)*eFront;
  float eSlit=.055*uPupil*sqrt(max(0.,1.-pow(eLy/eIrR,2.)));
  float ePupil=eIris*smoothstep(eSlit+.014,eSlit-.004,abs(eLx));
  float ePEdge=eIris*exp(-pow((abs(eLx)-eSlit)/.016,2.))*(1.-ePupil);
  float eLimb=m0*exp(-pow((eD-eIrR)/.028,2.))*eFront;
  float eSq=mix(1.,.62,m0);
  p.y*=mix(eSq,1.,eIris*.85)*mix(1.,uLid,m0);
  p*=1.+m0*.04*sin(dot(pos,vec3(2.,3.,1.))*1.5+uPh*1.2);
  float gz=m1*exp(-(1.-eIc)*9.);
  p+=eLd*gz*.07;
  float sW=.075*uPupil*sqrt(max(0.,1.-eLy*eLy));
  float sIn=m2*eFront*smoothstep(sW+.012,sW-.012,abs(eLx));
  float sEdge=m2*eFront*exp(-pow((abs(eLx)-sW)/.02,2.));
  p+=eAx*sign(eLx)*sIn*.09*length(p);
  float sk=m3*eFront*smoothstep(.62,0.,eD);
  float sAng=atan(eLy,eLx)+sk*(2.8*sk+uPh*1.4);
  float sR2=eD*mix(1.,.5+.5*smoothstep(0.,.62,eD),sk);
  vec2 sNew=vec2(cos(sAng),sin(sAng))*sR2;
  p+=(eAx*(sNew.x-eLx)+eAy*(sNew.y-eLy))*length(p)*m3*eFront;
  float sCore=m3*eFront*smoothstep(.14,.07,sR2);
  float sRing=m3*eFront*exp(-pow((sR2-.18)/.03,2.))*(1.+.7*sin(sAng+uPh*2.));
  float R=.6*uScale;
  float persp=1./(1.-p.z*.18);
  float cd=hs(pos.zyx)*.22;
  float m=uCon*hasD*smoothstep(.5+cd,.95+cd,uDT)*(1.-smoothstep(1.75+cd,2.45+cd,uDT));
  float cu=hs(pos.yxz)*1.34;
  vec2 cA=vec2(-.42,.02),cB=vec2(-.12,-.3),cC=vec2(.48,.34);
  vec2 tg=cu<.44?mix(cA,cB,cu/.44):mix(cB,cC,(cu-.44)/.9);
  tg+=(vec2(hs(pos.xzy),hs(pos.yzx))-.5)*.045;
  vec2 sp=vec2(p.x,p.y)*R*persp;
  vec2 pd=vec2(cos(uPullA),sin(uPullA));
  float pal=dot(normalize(sp+vec2(1e-5)),pd);
  float pk=pow(max(pal,0.),14.)*smoothstep(.25*R,.85*R,length(sp))*(.55+.45*step(0.,p.z));
  sp+=pd*pk*uPull*R*.32;
  sp-=(sp-pd*dot(sp,pd))*pk*max(uPull,0.)*.45;
  vec2 dc=uCur-sp;float dd=length(dc);
  float mk=uHov*exp(-dd*dd/(R*R)*3.)*(.5+.5*step(0.,p.z));
  sp+=dc*mk*.22*(1.-.75*uEye*step(uEyeMode,.5));
  gl_Position=vec4(mix(sp,tg*uScale,m),0.,1.);
  float limb=1.-abs(p.z);
  float front=step(0.,p.z);
  vec3 c=mix(uC2,uC1,.5+.5*p.y);
  c=mix(c,uC3,clamp(wv*uWave,0.,1.)*front);
  c=mix(c,uFillC,inside*.75);
  float vis=mix(mix(.35,1.,front),1.,inside*.5);
  float b=(.12+pow(limb,4.)*1.1+max(wv,0.)*uWave*.9*front+inside*.32+surf*1.1)*vis;
  vec3 irid=.62+.38*cos(6.2832*(vec3(0.,.33,.67)+pos.y*.35+pos.x*.2+lp*.6));
  c=mix(c,irid,flash*.85);
  b+=flash*1.3+gather*.5*limb;
  float sw=smoothstep(0.,1.,(uDT-.95)/1.3);
  float sheen=hasD*step(.95,uDT)*step(uDT,2.25)*exp(-pow(dot(p.xy,vec2(.83,.55))-mix(-1.3,1.3,sw),2.)*22.)*front;
  c=mix(c,vec3(1.),sheen*.7);b+=sheen*.9;
  float tw2=(1.-uMag)*on2*step(.9,hs(pos.xzy))*exp(-lp*2.5)*(.5+.5*sin(lp*22.+hs(pos)*6.));
  c=mix(c,vec3(1.),tw2);b+=tw2*2.5*front;
  c=mix(c,mix(irid,vec3(1.),.45),m);b=mix(b,1.25,m);
  b+=uVox*(.2+max(vrip,0.)*vlvl*1.2);c=mix(c,vec3(.62,.86,1.),uListen*.35);
  b+=pk*abs(uPull)*1.3+mk*1.1;
  vec3 eCol=mix(uC1,vec3(1.,.92,.7),smoothstep(eIrR,.05,eD)*.7);
  float eStreak=.75+.25*sin(atan(eLy,eLx)*16.+hs(pos)*4.+uPh);
  b=mix(b*mix(1.,.45,uEye),1.5*eStreak,eIris*.85)+eLimb*1.3+ePEdge*1.4;
  c=mix(c,eCol,eIris*.85);c=mix(c,uC2,eLimb*.4);c=mix(c,vec3(1.,.95,.8),ePEdge*.6);
  b*=1.-ePupil*.96;
  b+=gz*1.1;c=mix(c,vec3(1.,.95,.9),gz*.3);
  b*=mix(1.,.7,m2);b*=1.-sIn*.97;b+=sEdge*1.7;c=mix(c,vec3(1.,.92,.8),sEdge*.6);
  b*=mix(1.,.8,m3);b*=1.-sCore*.98;b+=sRing*1.5+sk*.25;c=mix(c,vec3(1.,.9,.7),sRing*.6);c=mix(c,vec3(1.),mk*.2);c=mix(c,vec3(1.),pk*max(uPull,0.)*.3);
  b*=emFade;b+=em*(1.-step(2.65,lp))*exp(-lp*.8)*.6;
  vC=c*b*uBright;
  vSoft=uBloom*(.45+flash*.55);
  gl_PointSize=uPt*(1.+p.z*.5)*(1.+surf*.5)*(1.+flash*.6)*(1.+uBloom*(.5+flash*2.5))*(1.+m*.3)*(1.+eIris*.35);
}`;
  const PFS = `precision highp float;varying vec3 vC;varying float vSoft;
void main(){float d=length(gl_PointCoord-.5);float a=mix(smoothstep(.5,.15,d),exp(-d*d*16.)*.75+smoothstep(.12,.04,d)*.6,vSoft);vec3 c=vC*a;gl_FragColor=vec4(c,max(c.r,max(c.g,c.b)));}`;
  const NEEDS = { C1: [1, .72, .22], C2: [1, .38, .24], C3: [1, .86, .55], H: [.6, .24, .08] };
  const ERR = { C1: [1, .2, .22], C2: [.72, .08, .2], C3: [1, .55, .45], H: [.5, .03, .06] };
  const DONE = { C1: [.95, .96, 1], C2: [.8, .78, 1], C3: [1, .9, .84], H: [.3, .3, .44] };
  const OUTCOME = {
    clean: DONE,
    warn: { C1: [1, .9, .74], C2: [.96, .74, .58], C3: [1, .84, .58], H: [.42, .28, .12] },
    success: { C1: [.74, 1, .84], C2: [.5, .88, .7], C3: [.9, 1, .92], H: [.1, .3, .18] },
    long: { C1: [.96, .88, 1], C2: [.84, .72, 1], C3: [1, .86, .56], H: [.36, .26, .52] }
  };
  const FIN = {
    default: { con: 0, ember: 0, impl: 0, lock: 0, bloom: 0 },
    constellation: { con: 1, ember: 0, impl: 0, lock: 0, bloom: 0 },
    embers: { con: 0, ember: 1, impl: 0, lock: 0, bloom: 0 },
    implode: { con: 0, ember: 0, impl: 1, lock: 0, bloom: 0 },
    ringlock: { con: 0, ember: 0, impl: 0, lock: 1, bloom: 0 },
    bloom: { con: 0, ember: 0, impl: 0, lock: 0, bloom: 1 }
  };
  const PAL = {
    claude: {
      idle: { C1: [.62, .66, .82], C2: [.4, .44, .62], C3: [.8, .82, .95], H: [.16, .18, .34] },
      working: { C1: [1, .46, .2], C2: [.56, .3, 1], C3: [1, .45, .72], H: [.3, .14, .75] },
      needs: NEEDS, error: ERR, done: DONE
    },
    blue: {
      idle: { C1: [.55, .6, 1], C2: [.35, .38, .85], C3: [.7, .8, 1], H: [.08, .1, .45] },
      working: { C1: [1, .3, .9], C2: [.3, .78, 1], C3: [1, .72, .6], H: [.12, .1, .95] },
      needs: NEEDS, error: ERR, done: DONE
    }
  };
  PAL.claude.voice = PAL.claude.working; PAL.blue.voice = PAL.blue.working;
  PAL.mono = {
    idle: { C1: [.7, .7, .74], C2: [.45, .45, .5], C3: [.85, .85, .9], H: [.15, .15, .18] },
    working: { C1: [.95, .95, 1], C2: [.55, .56, .62], C3: [1, 1, 1], H: [.22, .22, .28] },
    needs: PAL.claude.needs, error: PAL.claude.error, done: PAL.claude.done
  };
  PAL.mono.voice = PAL.mono.working;
  const mkPal = (w) => {
    const dz = (c, k, s) => { const l = c[0] * .3 + c[1] * .55 + c[2] * .15; return c.map(v => (v + (l - v) * k) * s); };
    const idle = { C1: dz(w.C1, .55, .78), C2: dz(w.C2, .55, .72), C3: dz(w.C3, .5, .9), H: dz(w.H, .4, .55) };
    return { idle, working: w, voice: w, needs: NEEDS, error: ERR, done: DONE };
  };
  Object.assign(PAL, {
    ember: mkPal({ C1: [1, .5, .28], C2: [.78, .3, .16], C3: [1, .74, .54], H: [.42, .13, .05] }),
    violet: mkPal({ C1: [.68, .5, 1], C2: [.42, .28, .86], C3: [.86, .78, 1], H: [.2, .1, .56] }),
    cyan: mkPal({ C1: [.32, .86, 1], C2: [.12, .5, .82], C3: [.74, .96, 1], H: [.03, .2, .42] }),
    mint: mkPal({ C1: [.42, 1, .74], C2: [.18, .68, .5], C3: [.8, 1, .9], H: [.04, .28, .18] }),
    rose: mkPal({ C1: [1, .44, .64], C2: [.76, .2, .42], C3: [1, .74, .86], H: [.4, .06, .2] }),
    sunset: mkPal({ C1: [1, .64, .26], C2: [.9, .2, .46], C3: [1, .86, .52], H: [.42, .08, .2] }),
    aurora: mkPal({ C1: [.36, 1, .7], C2: [.36, .3, 1], C3: [.62, .9, 1], H: [.05, .2, .46] }),
    ocean: mkPal({ C1: [.42, .95, 1], C2: [.16, .26, .92], C3: [.86, 1, 1], H: [.02, .1, .46] }),
    dusk: mkPal({ C1: [1, .56, .76], C2: [.3, .26, .86], C3: [1, .82, .7], H: [.22, .08, .46] }),
    citrus: mkPal({ C1: [.95, 1, .36], C2: [.14, .74, .56], C3: [1, 1, .76], H: [.12, .28, .05] }),
    opal: mkPal({ C1: [.74, .95, 1], C2: [.95, .58, .9], C3: [1, .95, .74], H: [.26, .18, .42] })
  });
  window.OrbPalettes = PAL;
  const MOTION = {
    idle: { energy: .12, wave: .08, glow: .35, bright: .5, ring: .35, scale: .72, glitch: 0 },
    working: { energy: 1, wave: 1, glow: 1, bright: 1, ring: 1, scale: 1, glitch: 0 },
    needs: { energy: .22, wave: .18, glow: .85, bright: .75, ring: .9, scale: 1, glitch: 0 },
    error: { energy: .08, wave: 0, glow: .75, bright: .8, ring: .85, scale: .9, glitch: 1 },
    voice: { energy: .3, wave: .12, glow: .8, bright: .9, ring: .9, scale: .96, glitch: 0 },
    done: { energy: .1, wave: .05, glow: .6, bright: .7, ring: .75, scale: .86, glitch: 0 }
  };
  const ACT = {
    none: { WF: 7, WS: 2.6, chop: 0 },
    read: { WF: 3.2, WS: 1.1, chop: 0 },
    edit: { WF: 12, WS: 3.8, chop: 0 },
    bash: { WF: 7, WS: 3.2, chop: 1 }
  };
  const WORK = { wave: 0, scan: 1, ripple: 2, wring: 3, orbits: 4, synapse: 5, boil: 6, swell: 7, crosswave: 8, drift: 9, interference: 10, pulse: 11, radar: 12, bounce: 13, lines: 14, simmer: 15, surf: 16, converge: 17, glance: 18, lens: 19, pen: 20, stack: 21, typewriter: 22, link: 23, compact: 24, wait: 25, bash: 26, spiral: 27, squeeze: 28, pack: 29, breathe: 30 };
  const SHAPES = { sphere: 0, blob: 1, torus: 2, cube: 3, galaxy: 4, planet: 5, helix: 6, box: 7, pyramid: 8, octahedron: 9, tetrahedron: 10, donut: 11 };
  const RINGK = [1, .8, .15, .3, .08, .25, .1, 1, 1, 1, 1, 1];
  const HEAT = [1, .5, .18], HEATH = [.6, .22, .05];
  const lerp3 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  const ss = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const N = 5200, pts = new Float32Array(N * 3), ga = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) { const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), t = ga * i; pts[i * 3] = Math.cos(t) * r; pts[i * 3 + 1] = y; pts[i * 3 + 2] = Math.sin(t) * r; }
  const boot = () => {
    const renderer = window.OrbShared((gl, R) => {
      const U = (p, ks) => { const o = {}; ks.forEach(k => o[k] = gl.getUniformLocation(p, k)); return o; };
      const qp = R.prog(QVS, QFS), pp = R.prog(PVS, PFS);
      const qb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, qb); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const pb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, pb); gl.bufferData(gl.ARRAY_BUFFER, pts, gl.STATIC_DRAW);
      return {
        qp, pp, qb, pb, qa: gl.getAttribLocation(qp, 'p'), pa: gl.getAttribLocation(pp, 'pos'),
        qu: U(qp, ['uProg', 'uProgF', 'uRes', 'uPh', 'uScale', 'uGlow', 'uRing', 'uC1', 'uC2', 'uC3', 'uHalo', 'uGlitch', 'uSpread', 'uDT', 'uRingLock', 'uMag', 'uPull', 'uPullA', 'uHov', 'uCur', 'uVox', 'uVoxPh', 'uListen', 'uEye', 'uLid', 'uShA', 'uShB', 'uShM']),
        pu: U(pp, ['uSettle', 'uSat', 'uFail', 'uSkill', 'uTicks', 'uTickA', 'uBase', 'uWork', 'uWorkB', 'uWorkM', 'uSub', 'uBoil', 'uRings', 'uPh', 'uWave', 'uScale', 'uPt', 'uC1', 'uC2', 'uC3', 'uBright', 'uGlitch', 'uFill', 'uWF', 'uWS', 'uChop', 'uDT', 'uFillC', 'uCon', 'uEmber', 'uImpl', 'uBloom', 'uMag', 'uPull', 'uPullA', 'uHov', 'uCur', 'uVox', 'uVoxPh', 'uListen', 'uVoxB', 'uEye', 'uLid', 'uPupil', 'uLook', 'uEyeMode', 'uShA', 'uShB', 'uShM'])
      };
    });
    class OrbP extends window.OrbBase {
      static get observedAttributes() { return ['state', 'palette', 'size', 'fill', 'activity', 'urgency', 'timescale', 'finish', 'magnitude', 'outcome', 'pull', 'interactive', 'tint', 'dim', 'eye', 'shape', 'work', 'pulse', 'subagents', 'heat', 'base', 'tick', 'satellites', 'fail', 'skill', 'progress', 'elapsed', 'blend']; }
      renderer() { return renderer; }
      connectedCallback() { super.connectedCallback(); this.setupInteractive(); }
      disconnectedCallback() { super.disconnectedCallback(); this.teardownInteractive(); }
      setupInteractive() {
        if (this._pm || !this.hasAttribute('interactive') || this.getAttribute('interactive') === 'false') return;
        this.mc = this.mc || [0, -2]; this.mcT = this.mcT || [0, -2]; this.hov = this.hov || 0; this.hovT = 0;
        this._pm = (e) => {
          const r = this.getBoundingClientRect(), h = r.width / 2 || 1;
          this.mcT = [(e.clientX - r.left - h) / h, -(e.clientY - r.top - h) / h];
          const d = Math.hypot(this.mcT[0], this.mcT[1]);
          this.hovT = 1 - ss(.85, 1.7, d);
          this.style.cursor = d < .7 ? 'pointer' : '';
        };
        this._pl = () => { this.hovT = 0; };
        window.addEventListener('pointermove', this._pm, { passive: true });
        document.documentElement.addEventListener('pointerleave', this._pl);
      }
      teardownInteractive() {
        if (!this._pm) return;
        window.removeEventListener('pointermove', this._pm);
        document.documentElement.removeEventListener('pointerleave', this._pl);
        this._pm = this._pl = null; this.hovT = 0;
      }
      palettes() { return PAL; }
      motion() { return MOTION; }
      attributeChangedCallback(n, o, v) {
        if (!this.c2) return;
        if (n === 'size') { this.resize(); return; }
        if (n === 'work' || n === 'subagents' || n === 'heat' || n === 'base' || n === 'satellites' || n === 'elapsed' || n === 'blend') return;
        const fresh = v && v !== o && v !== '0';
        if (n === 'tick') { if (fresh) { const c = this.clock || 0; this.ticks = (this.ticks || []).filter(k => c - k[0] < .8); this.tickHist = (this.tickHist || []).filter(x => c - x < 1.5); this.tickHist.push(c); this.ticks.push([c, Math.max(.3, 1 / (1 + .35 * (this.tickHist.length - 1)))]); if (this.ticks.length > 3) this.ticks.shift(); } return; }
        if (n === 'fail') { if (fresh) { this.failT = this.clock || 0; this.shake = .3; } return; }
        if (n === 'skill') { if (fresh) this.skillT = this.clock || 0; return; }
        if (n === 'progress') { const [dn, tt] = String(v || '').split('/').map(Number); const pd = this.prog ? this.prog[0] : 0; this.prog = isNaN(tt) ? null : [dn || 0, tt]; if (this.prog && dn > pd) this.progT = this.clock || 0; return; }
        if (n === 'pulse') { if (v && v !== o && v !== '0') { (this.rings = this.rings || []).push(this.clock || 0); if (this.rings.length > 3) this.rings.shift(); } return; }
        if (n === 'shape') { const k = SHAPES[v] ?? 0; if (this.shB == null) { this.shA = this.shB = k; this.shM = 1; } else if (k !== this.shB) { this.shA = this.shM < .5 ? this.shA : this.shB; this.shB = k; this.shM = 0; } return; }
        if (n === 'interactive') { if (v != null && v !== 'false') this.setupInteractive(); else this.teardownInteractive(); return; }
        if (n === 'pull') { const ang = parseFloat(v); if (!isNaN(ang)) { const pa = parseFloat(String(v).split(':')[2]); this.pullAmp = isNaN(pa) ? 1 : pa; this.pullA = -ang * Math.PI / 180; this.pullT = 0; } return; }
        if (n === 'state' && v !== o) {
          if (v === 'needs') { this.bounce = -.28; this.bv = 0; this.lastB = this.clock; }
          if (v === 'error' && o) this.shake = 1;
          if (v === 'done') { this.burstT = 0; this.pendingDone = true; return; }
          this.pendingDone = false;
        }
        if (n === 'timescale') return;
        this.applyTargets(false);
      }
      applyTargets(snap) {
        const st = this.getAttribute('state') || 'idle', pal = PAL[this.getAttribute('palette')] || PAL.claude;
        const act = ACT[this.getAttribute('activity')] || ACT.none;
        const num = (k) => Math.max(0, Math.min(1, parseFloat(this.getAttribute(k)) || 0));
        const magA = this.getAttribute('magnitude'), mag = magA == null ? 1 : Math.max(0, Math.min(1, parseFloat(magA)));
        const fin = FIN[this.getAttribute('finish')] || FIN.default;
        this.fx = { ...fin, mag, ember: fin.ember || (mag > .85 && this.hasAttribute('magnitude') ? 1 : 0) };
        const colors = st === 'done' ? (OUTCOME[this.getAttribute('outcome')] || DONE) : (pal[st] || pal.idle);
        this.tgt = JSON.parse(JSON.stringify({ ...colors, ...(MOTION[st] || MOTION.idle), ...act, fill: num('fill'), urg: num('urgency'), dim: num('dim'), ...(() => { const tv = (this.getAttribute('tint') || '').split(',').map(Number); return tv.length === 4 && tv.every(x => !isNaN(x)) ? { TINT: tv.slice(0, 3), tintA: tv[3] } : { TINT: [1, 1, 1], tintA: 0 }; })() }));
        if (this.hasAttribute('static')) { snap = true; this._dirty = true; }
        if (this.hasAttribute('mini')) {
          const T = this.tgt;
          T.scale = Math.max(T.scale, .95); T.energy = Math.max(T.energy, .7); T.wave = Math.max(T.wave, .7);
          T.ring = Math.max(T.ring, .9); T.bright = Math.max(T.bright, .9); T.glow = Math.max(T.glow, .6);
          if (this.cur) for (const k of ['scale', 'energy', 'wave', 'ring', 'bright', 'glow']) if (snap) this.cur[k] = T[k];
        }
        if (snap || !this.cur) { this.cur = JSON.parse(JSON.stringify(this.tgt)); if (st === 'needs') this.bounce = -.28; }
      }
      step(dt, now) {
        if (this.hasAttribute('static')) {
          if (this.f && !this._dirty) return;
          this._dirty = false; dt = 0; now = this.t0;
        }
        dt *= parseFloat(this.getAttribute('timescale')) || 1;
        this.stepCommon(dt);
        const cur = this.cur; this.ph += dt * (.2 + cur.energy * 1.5) * (1 - .6 * (cur.dim || 0));
        const t = (now - this.t0) / 1000, st = this.getAttribute('state');
        this.clock = t;
        {
          const wk = WORK[this.getAttribute('work')] || 0;
          if (this.wB == null) { this.wA = this.wB = wk; this.wM = 1; }
          else if (wk !== this.wB && this.wM >= 1) { this.wA = this.wB; this.wB = wk; this.wM = 0; }
          this.wM = Math.min(1, this.wM + dt / (parseFloat(this.getAttribute('blend')) || .8));
          { const sT = 1 - Math.exp(-(parseFloat(this.getAttribute('elapsed')) || 0) / 6); this.settleV = sT < (this.settleV || 0) - .3 ? sT : (this.settleV || 0) + (sT - (this.settleV || 0)) * (1 - Math.pow(.2, dt)); }
          this.satV = (this.satV || 0) + ((parseFloat(this.getAttribute('satellites')) || 0) - (this.satV || 0)) * (1 - Math.pow(.02, dt));
          if (this.skillT != null) { const sa = t - this.skillT; if (sa < 1.4) this.ph += dt * 1.2 * Math.sin(Math.PI * Math.min(1, sa / 1.4)); }
          const lk = 1 - Math.pow(.06, dt);
          this.subV = (this.subV || 0) + ((parseFloat(this.getAttribute('subagents')) || 0) - (this.subV || 0)) * lk;
          this.heatV = (this.heatV || 0) + ((parseFloat(this.getAttribute('heat')) || 0) - (this.heatV || 0)) * lk;
          this.rings = (this.rings || []).filter(r => t - r < 2.5);
          this.baseV = (this.baseV || 0) + ((parseFloat(this.getAttribute('base')) || 0) - (this.baseV || 0)) * lk;
        }
        let scale = cur.scale * (1 + this.bounce), glow = cur.glow, ring = cur.ring, spread = 1, dT = -1;
        if (st === 'idle') { const b = Math.sin(t * Math.PI / 2); scale *= 1 + .05 * b; glow *= .7 + .3 * b; ring *= .75 + .25 * b; }
        if (st === 'needs') {
          const u = cur.urg, per = 2.8 - 1.4 * u, b = Math.sin(t * 2 * Math.PI / per);
          glow *= (.6 + .4 * b) * (1 + .9 * u); ring *= .8 + .2 * b; spread = 1 + .9 * u;
          if (this.lastB == null) this.lastB = t;
          if (u > .05 && t - this.lastB > 9 - 6.5 * u) { this.bounce = -(.12 + .16 * u); this.bv = 0; this.lastB = t; }
        }
        if (st === 'error') { ring *= Math.random() < .08 ? .35 : 1; glow *= .85 + .15 * Math.sin(t * 9); }
        if (st === 'done' && this.burstT != null) {
          const bt = this.burstT += dt;
          if (this.pendingDone && bt >= .42) { this.pendingDone = false; this.applyTargets(false); }
          const fx = this.fx || {}, mg = fx.mag ?? 1;
          const g = ss(0, .38, bt) * (1 - ss(.38, .46, bt)) * mg, l = Math.max(bt - .42, 0), rel = bt > .42 ? (.4 + .6 * mg) : 0;
          scale *= 1 - (fx.impl ? .5 : .06) * g + rel * (fx.impl ? .16 : .07) * Math.exp(-l * 4.5) * Math.sin(l * 13 + .2);
          glow *= 1 + 1.6 * g + rel * 2.2 * Math.exp(-l * 1.6);
          ring *= 1 + .8 * g;
          this.ph += dt * (2.5 * g + rel * 2 * Math.exp(-l * 2));
          if (bt < 5) dT = bt;
        }
        this.shake = (this.shake || 0) * Math.pow(.02, dt);
        const sx = this.shake > .01 ? Math.sin(t * 70) * this.shake * this.px * .04 : 0;
        const hk = 1 - Math.pow(.015, dt), ck = 1 - Math.pow(.0008, dt);
        this.hov = (this.hov || 0) + ((this.hovT || 0) - (this.hov || 0)) * hk;
        if (this.mcT) { this.mc[0] += (this.mcT[0] - this.mc[0]) * ck; this.mc[1] += (this.mcT[1] - this.mc[1]) * ck; }
        const vid = this.getAttribute('voice'), vs = vid && window.OrbVoice ? window.OrbVoice[vid] : null;
        const tl = vs ? Math.min(1, vs.level || 0) : 0, vx = this.vox || 0;
        this.vox = vx + (tl - vx) * (1 - Math.pow(tl > vx ? .00002 : .006, dt));
        this.voxB = this.voxB || [0, 0, 0];
        const bt3 = vs ? [vs.low || 0, vs.mid || 0, vs.high || 0] : [0, 0, 0];
        for (let q = 0; q < 3; q++) this.voxB[q] += (bt3[q] - this.voxB[q]) * (1 - Math.pow(.0005, dt));
        const lt = vs && vs.mode === 'listen' ? 1 : 0;
        this.listen = (this.listen || 0) + (lt - (this.listen || 0)) * (1 - Math.pow(.03, dt));
        this.voxPh = (this.voxPh || 0) + dt * (2 + this.vox * 10) * (lt ? -1 : 1);
        glow *= 1 + this.vox * .7;
        { const dm = cur.dim || 0; scale *= 1 - .12 * dm; glow *= 1 - .35 * dm; ring *= 1 - .25 * dm; }
        const hv = this.hov, cc = this.mc || [0, 0];
        {
          const ea = this.getAttribute('eye'), emode = ea === 'subtle' ? 1 : ea === 'slit' ? 2 : ea === 'singularity' ? 3 : 0;
          const EYT = emode === 2 ? { idle: [1, 1], working: [1, .8], needs: [1, .4], error: [1, .3], done: [1, 1.2], voice: [1, 1] } : { idle: [.72, 1], working: [1, .8], needs: [1.18, 1.8], error: [1, .45], done: [.86, .95], voice: [1, 1] };
          const EY = EYT[st] || [1, 1];
          const ek = 1 - Math.pow(.02, dt);
          this.eyeV = (this.eyeV || 0) + ((this.hasAttribute('eye') && this.getAttribute('eye') !== 'false' ? 1 : 0) - (this.eyeV || 0)) * ek;
          this.lidV = (this.lidV ?? 1) + (EY[0] - (this.lidV ?? 1)) * ek;
          this.pupV = (this.pupV ?? 1) + (EY[1] - (this.pupV ?? 1)) * ek;
          if (this.blinkAt == null) this.blinkAt = t + 3 + Math.random() * 4;
          let bm = 1;
          if (this.blinkP == null && t > this.blinkAt && emode === 0) this.blinkP = 0;
          if (this.blinkP != null) { this.blinkP += dt / .26; bm = 1 - Math.sin(Math.PI * Math.min(1, this.blinkP)) * .94; if (this.blinkP >= 1) { this.blinkP = null; this.blinkAt = t + 5 + Math.random() * 5; } }
          const lt = hv > .05 ? [Math.max(-1, Math.min(1, cc[0])), Math.max(-1, Math.min(1, cc[1]))] : [Math.sin(t * .37) * .7, Math.sin(t * .23 + 1) * .35];
          this.look = this.look || [0, 0];
          const lk = 1 - Math.pow(.003, dt); this.look[0] += (lt[0] - this.look[0]) * lk; this.look[1] += (lt[1] - this.look[1]) * lk;
          this.eyeF = { eye: this.eyeV, eyeQ: emode === 0 ? this.eyeV : 0, eyeMode: emode, lid: this.lidV * bm, pupil: this.pupV, look: this.look };
        }
        glow *= 1 + .7 * hv; ring *= 1 + .35 * hv; scale *= 1 + .04 * hv;
        this.ph += dt * hv * .6;
        const cl = Math.min(1, Math.hypot(cc[0], cc[1])), cn = cl > 1e-4 ? [cc[0] / Math.hypot(cc[0], cc[1]) * cl, cc[1] / Math.hypot(cc[0], cc[1]) * cl] : [0, 0];
        const mx = cn[0] * hv * this.px * .045, my = -cn[1] * hv * this.px * .045;
        const tx = sx + mx, ty = my, moving = Math.abs(tx) > .02 || Math.abs(ty) > .02;
        if (moving || this._hadT) { this.c2.style.transform = moving ? 'translate(' + tx.toFixed(2) + 'px,' + ty.toFixed(2) + 'px)' : ''; this._hadT = moving; }
        let pull = 0;
        if (this.pullT != null) {
          const pt = this.pullT += dt, S1 = .32;
          if (pt < S1) { const x = pt / S1; pull = x * x * (3 - 2 * x); }
          else { const l = pt - S1; pull = Math.exp(-l * 7) * Math.cos(l * 30); }
          if (pt > 2) this.pullT = null;
          pull *= this.pullAmp ?? 1;
        }
        if (this.shB == null) { const k0 = SHAPES[this.getAttribute('shape')] ?? 0; this.shA = this.shB = k0; this.shM = 1; }
        this.shM = Math.min(1, (this.shM ?? 1) + dt / .95);
        const shE = this.shM * this.shM * (3 - 2 * this.shM);
        ring *= RINGK[this.shA] + (RINGK[this.shB] - RINGK[this.shA]) * shE;
        this.shF = { shA: this.shA, shB: this.shB, shM: shE };
        this.f = { scale, glow, ring, spread, dT, heat: ss(.75, .95, cur.fill), pull, pullA: this.pullA || 0, hov: this.hov || 0, mc: this.mc || [0, -2], vox: this.vox || 0, voxPh: this.voxPh || 0, listen: this.listen || 0, voxB: this.voxB || [0, 0, 0], ...(this.eyeF || { eye: 0, eyeQ: 0, eyeMode: 0, lid: 1, pupil: 1, look: [0, 0] }), ...this.shF };
      }
      draw(gl, c, w) {
        const cur = this.cur, f = this.f, h = f.heat * .8;
        const TA = cur.tintA || 0, TC = cur.TINT || [1, 1, 1], TH = [TC[0] * .5, TC[1] * .4, TC[2] * .35];
        gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE);
        gl.useProgram(c.qp); const q = c.qu;
        gl.bindBuffer(gl.ARRAY_BUFFER, c.qb); gl.enableVertexAttribArray(c.qa); gl.vertexAttribPointer(c.qa, 2, gl.FLOAT, false, 0, 0);
        gl.uniform2f(q.uRes, w, w); gl.uniform2f(q.uProg, this.prog ? this.prog[0] : 0, this.prog ? this.prog[1] : 0); gl.uniform1f(q.uProgF, this.progT != null ? (this.clock || 0) - this.progT : -1); gl.uniform1f(q.uPh, this.ph); gl.uniform1f(q.uScale, f.scale);
        { const cr = this.hasAttribute('crisp') && this.px < 120 ? this.px / 120 : 1; gl.uniform1f(q.uGlow, f.glow * (.35 + .65 * cr)); gl.uniform1f(q.uRing, f.ring * (.6 + .4 * cr)); } gl.uniform1f(q.uGlitch, cur.glitch);
        gl.uniform1f(q.uSpread, f.spread); gl.uniform1f(q.uDT, f.dT);
        const fx = this.fx || FIN.default; gl.uniform1f(q.uRingLock, fx.lock); gl.uniform1f(q.uMag, fx.mag ?? 1); gl.uniform1f(q.uPull, f.pull); gl.uniform1f(q.uPullA, f.pullA); gl.uniform1f(q.uEye, f.eyeQ); gl.uniform1f(q.uShA, f.shA); gl.uniform1f(q.uShB, f.shB); gl.uniform1f(q.uShM, f.shM); gl.uniform1f(q.uLid, f.lid); gl.uniform1f(q.uVox, f.vox); gl.uniform1f(q.uVoxPh, f.voxPh); gl.uniform1f(q.uListen, f.listen); gl.uniform1f(q.uHov, f.hov); gl.uniform2f(q.uCur, f.mc[0], f.mc[1]);
        gl.uniform3fv(q.uC1, lerp3(lerp3(cur.C1, HEAT, h), TC, TA)); gl.uniform3fv(q.uC2, lerp3(lerp3(cur.C2, HEAT, h), TC, TA)); gl.uniform3fv(q.uC3, lerp3(lerp3(cur.C3, HEAT, h), TC, TA)); gl.uniform3fv(q.uHalo, lerp3(lerp3(cur.H, HEATH, h), TH, TA));
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        gl.disableVertexAttribArray(c.qa);
        gl.useProgram(c.pp); const p = c.pu;
        gl.bindBuffer(gl.ARRAY_BUFFER, c.pb); gl.enableVertexAttribArray(c.pa); gl.vertexAttribPointer(c.pa, 3, gl.FLOAT, false, 0, 0);
        { const wm = this.wM ?? 1, we = wm * wm * (3 - 2 * wm), rg = this.rings || [], ck = this.clock || 0; gl.uniform1f(p.uWork, this.wA ?? (WORK[this.getAttribute('work')] || 0)); gl.uniform1f(p.uWorkB, this.wB ?? (WORK[this.getAttribute('work')] || 0)); gl.uniform1f(p.uWorkM, we); gl.uniform1f(p.uBase, this.baseV || 0); gl.uniform1f(p.uSat, this.satV || 0); gl.uniform1f(p.uSettle, this.settleV || 0); gl.uniform1f(p.uFail, this.failT != null ? ck - this.failT : -1); gl.uniform1f(p.uSkill, this.skillT != null ? ck - this.skillT : -1); { const tk = this.ticks || []; gl.uniform3f(p.uTicks, tk[0] ? ck - tk[0][0] : -1, tk[1] ? ck - tk[1][0] : -1, tk[2] ? ck - tk[2][0] : -1); gl.uniform3f(p.uTickA, tk[0] ? tk[0][1] : 0, tk[1] ? tk[1][1] : 0, tk[2] ? tk[2][1] : 0); } gl.uniform1f(p.uSub, this.subV || 0); gl.uniform1f(p.uBoil, this.heatV || 0); gl.uniform3f(p.uRings, rg[0] != null ? ck - rg[0] : -1, rg[1] != null ? ck - rg[1] : -1, rg[2] != null ? ck - rg[2] : -1); } gl.uniform1f(p.uPh, this.ph); gl.uniform1f(p.uWave, cur.wave); gl.uniform1f(p.uScale, f.scale); gl.uniform1f(p.uGlitch, cur.glitch);
        gl.uniform1f(p.uPt, (this.hasAttribute('crisp') ? Math.max(.42, Math.min(1, this.px / 200)) : Math.max(1, this.px / 200)) * this.dpr * 1.6);
        gl.uniform1f(p.uFill, cur.fill); gl.uniform1f(p.uWF, cur.WF); gl.uniform1f(p.uWS, cur.WS); gl.uniform1f(p.uChop, cur.chop); gl.uniform1f(p.uDT, f.dT);
        gl.uniform1f(p.uCon, fx.con); gl.uniform1f(p.uEmber, fx.ember); gl.uniform1f(p.uImpl, fx.impl); gl.uniform1f(p.uBloom, fx.bloom); gl.uniform1f(p.uMag, fx.mag ?? 1); gl.uniform1f(p.uPull, f.pull); gl.uniform1f(p.uPullA, f.pullA); gl.uniform1f(p.uEye, f.eye); gl.uniform1f(p.uEyeMode, f.eyeMode); gl.uniform1f(p.uShA, f.shA); gl.uniform1f(p.uShB, f.shB); gl.uniform1f(p.uShM, f.shM); gl.uniform1f(p.uLid, f.lid); gl.uniform1f(p.uPupil, f.pupil); gl.uniform2f(p.uLook, f.look[0], f.look[1]); gl.uniform1f(p.uVox, f.vox); gl.uniform1f(p.uVoxPh, f.voxPh); gl.uniform1f(p.uListen, f.listen); gl.uniform3fv(p.uVoxB, f.voxB); gl.uniform1f(p.uHov, f.hov); gl.uniform2f(p.uCur, f.mc[0], f.mc[1]);
        gl.uniform3fv(p.uC1, lerp3(cur.C1, TC, TA * .5)); gl.uniform3fv(p.uC2, lerp3(cur.C2, TC, TA * .5)); gl.uniform3fv(p.uC3, lerp3(cur.C3, TC, TA * .5)); gl.uniform1f(p.uBright, cur.bright * (this.hasAttribute('crisp') && this.px < 120 ? .75 + .25 * this.px / 120 : 1));
        gl.uniform3fv(p.uFillC, lerp3(cur.C3, HEAT, f.heat));
        gl.drawArrays(gl.POINTS, 0, N);
        gl.disableVertexAttribArray(c.pa);
      }
    }
    customElements.define('orb-particles', OrbP);
  };
  if (window.OrbShared) boot();
  else if (window.__orbSharedLoading) window.__orbSharedLoading.then(boot);
  else {
    window.__orbSharedLoading = new Promise(res => { const s = document.createElement('script'); s.src = new URL('orbShared.js', document.baseURI).href; s.onload = res; document.head.appendChild(s); });
    window.__orbSharedLoading.then(boot);
  }
})();
