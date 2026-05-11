/**
 * 🔄 WebSocket Real-Time Attack Stream Server
 * 
 * Server-Sent Events (SSE) based real-time attack feed for the Threat Map.
 * Uses SSE instead of WebSocket for compatibility with Next.js Edge/Serverless.
 * Streams simulated cyber attacks every 800ms-2s with realistic patterns.
 */
import { NextRequest } from 'next/server';

// Country data with weights
const C = [
  { c: 'US', a: 'الولايات المتحدة', lat: 38.9, lng: -77, w: 18 },
  { c: 'CN', a: 'الصين', lat: 39.9, lng: 116.4, w: 22 },
  { c: 'RU', a: 'روسيا', lat: 55.7, lng: 37.6, w: 16 },
  { c: 'DE', a: 'ألمانيا', lat: 52.5, lng: 13.4, w: 8 },
  { c: 'IN', a: 'الهند', lat: 28.6, lng: 77.2, w: 10 },
  { c: 'IR', a: 'إيران', lat: 35.7, lng: 51.4, w: 9 },
  { c: 'KP', a: 'كوريا الشمالية', lat: 39, lng: 125.7, w: 6 },
  { c: 'GB', a: 'بريطانيا', lat: 51.5, lng: -0.1, w: 5 },
  { c: 'SA', a: 'السعودية', lat: 24.7, lng: 46.7, w: 6 },
  { c: 'AE', a: 'الإمارات', lat: 25.2, lng: 55.3, w: 5 },
  { c: 'EG', a: 'مصر', lat: 30, lng: 31.2, w: 4 },
  { c: 'TR', a: 'تركيا', lat: 41, lng: 28.9, w: 5 },
  { c: 'IL', a: 'إسرائيل', lat: 31.8, lng: 35.2, w: 7 },
  { c: 'UA', a: 'أوكرانيا', lat: 50.4, lng: 30.5, w: 6 },
  { c: 'BR', a: 'البرازيل', lat: -15.8, lng: -47.9, w: 7 },
  { c: 'JP', a: 'اليابان', lat: 35.7, lng: 139.7, w: 4 },
  { c: 'FR', a: 'فرنسا', lat: 48.9, lng: 2.3, w: 5 },
  { c: 'NL', a: 'هولندا', lat: 52.4, lng: 4.9, w: 5 },
  { c: 'AU', a: 'أستراليا', lat: -33.9, lng: 151.2, w: 3 },
  { c: 'KR', a: 'كوريا الجنوبية', lat: 37.6, lng: 127, w: 4 },
  { c: 'PK', a: 'باكستان', lat: 33.7, lng: 73, w: 4 },
  { c: 'NG', a: 'نيجيريا', lat: 9.1, lng: 7.5, w: 5 },
  { c: 'ID', a: 'إندونيسيا', lat: -6.2, lng: 106.8, w: 3 },
  { c: 'CA', a: 'كندا', lat: 45.4, lng: -75.7, w: 4 },
  { c: 'PL', a: 'بولندا', lat: 52.2, lng: 21, w: 3 },
  { c: 'MX', a: 'المكسيك', lat: 19.4, lng: -99.1, w: 3 },
  { c: 'VN', a: 'فيتنام', lat: 21, lng: 105.8, w: 4 },
  { c: 'RO', a: 'رومانيا', lat: 44.4, lng: 26.1, w: 3 },
  { c: 'SG', a: 'سنغافورة', lat: 1.3, lng: 103.8, w: 3 },
  { c: 'QA', a: 'قطر', lat: 25.3, lng: 51.5, w: 2 },
];

const ATK = [
  { id: 'ddos', a: 'حجب خدمة', e: 'DDoS', i: '🌊', s: 'critical', w: 15 },
  { id: 'brute', a: 'قوة غاشمة', e: 'Brute Force', i: '🔨', s: 'high', w: 18 },
  { id: 'sqli', a: 'حقن SQL', e: 'SQLi', i: '💉', s: 'critical', w: 12 },
  { id: 'xss', a: 'XSS', e: 'XSS', i: '🕷️', s: 'high', w: 10 },
  { id: 'phish', a: 'تصيد', e: 'Phishing', i: '🎣', s: 'medium', w: 20 },
  { id: 'ransom', a: 'فدية', e: 'Ransomware', i: '🔐', s: 'critical', w: 8 },
  { id: 'malware', a: 'خبيثة', e: 'Malware', i: '🦠', s: 'high', w: 14 },
  { id: 'scan', a: 'فحص', e: 'Port Scan', i: '🔍', s: 'low', w: 22 },
  { id: 'zero', a: 'يوم صفر', e: 'Zero-Day', i: '💀', s: 'critical', w: 3 },
  { id: 'apt', a: 'APT', e: 'APT', i: '🎯', s: 'critical', w: 4 },
  { id: 'exfil', a: 'تسريب', e: 'Exfiltration', i: '📤', s: 'critical', w: 5 },
  { id: 'c2', a: 'C2', e: 'C2 Beacon', i: '📡', s: 'high', w: 6 },
  { id: 'cred', a: 'حشو', e: 'Credential Stuffing', i: '🔑', s: 'high', w: 10 },
  { id: 'crypto', a: 'تعدين', e: 'Cryptojacking', i: '⛏️', s: 'medium', w: 8 },
];

const APTS = ['APT28','APT29','APT41','Lazarus','Sandworm','Turla','FIN7','DarkSide','REvil','Conti','OilRig','Kimsuky','Hafnium','Nobelium'];

function wr<T extends {w:number}>(a:T[]):T{let t=a.reduce((s,i)=>s+i.w,0),r=Math.random()*t;for(const i of a){r-=i.w;if(r<=0)return i}return a[a.length-1]}

function rIP(){const f=[1,5,8,14,23,31,37,41,45,49,58,72,80,91,95,103,110,120,128,142,155,168,185,193,203,210,220];return `${f[Math.floor(Math.random()*f.length)]}.${Math.floor(Math.random()*256)}.${Math.floor(Math.random()*256)}.${Math.floor(Math.random()*254)+1}`}

function gen(){
  const s=wr(C);let t=wr(C);while(t.c===s.c)t=wr(C);
  const a=wr(ATK);
  const isA=a.id==='apt'||(a.s==='critical'&&Math.random()<0.3);
  return {
    id:crypto.randomUUID(),
    ts:new Date().toISOString(),
    src:{c:s.c,a:s.a,lat:s.lat+(Math.random()-0.5)*4,lng:s.lng+(Math.random()-0.5)*4,ip:rIP()},
    tgt:{c:t.c,a:t.a,lat:t.lat+(Math.random()-0.5)*4,lng:t.lng+(Math.random()-0.5)*4,ip:rIP(),port:[80,443,22,3389,8080,53,445,3306][Math.floor(Math.random()*8)]},
    atk:{t:a.id,a:a.a,e:a.e,i:a.i,s:a.s},
    apt:isA?APTS[Math.floor(Math.random()*APTS.length)]:null,
    blocked:Math.random()<0.65,
  };
}

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    start(controller) {
      // Send initial burst of 5 attacks
      for (let i = 0; i < 5; i++) {
        const data = JSON.stringify(gen());
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      }

      // Then stream attacks at variable intervals (800ms - 2500ms)
      const interval = setInterval(() => {
        try {
          // Generate 1-3 attacks per tick for burst patterns
          const burstCount = Math.random() < 0.2 ? 3 : Math.random() < 0.4 ? 2 : 1;
          for (let i = 0; i < burstCount; i++) {
            const data = JSON.stringify(gen());
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }
        } catch {
          clearInterval(interval);
          controller.close();
        }
      }, 800 + Math.random() * 1700);

      // Auto-close after 5 minutes to prevent resource leaks
      setTimeout(() => {
        clearInterval(interval);
        try { controller.close(); } catch {}
      }, 5 * 60 * 1000);

      // Handle client disconnect
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        try { controller.close(); } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-store',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  });
}
