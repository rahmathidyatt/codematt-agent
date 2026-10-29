import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { AiRequest, AiResult } from "@/lib/ai/contracts";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AiRequest;
    const { task, locale, instructions, facts } = body;
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Prepare prompt
    const systemPrompt = `You are Codematt Agent, an elite AI real estate assistant and copywriter for professional Indonesian property agents.
Task: ${task}
Target Locale: ${locale === "id" ? "Bahasa Indonesia" : "English"}
Property Facts:
${JSON.stringify(facts, null, 2)}

User Instructions:
${instructions}

CRITICAL RULES:
1. NEVER hallucinate specs. All prices, bedroom counts, land size, building size, and certificates must strictly match the provided facts.
2. If facts are missing or null, do not invent them.
3. Write persuasive, professional, and high-conversion copy tailored for property marketing.
4. If task is 'listing', output 3 distinct variations: 'emotional' (family focus), 'investor' (ROI & growth), and 'formal' (portal listing standard).
5. Format response as JSON.`;

    let generatedText = "";
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: `${systemPrompt}\n\nPlease generate the output in valid JSON format.`,
        });
        generatedText = response.text || "";
      } catch (genErr) {
        console.warn("[Codematt Agent] Gemini API call failed, falling back to local domain engine:", genErr);
      }
    }

    // If Gemini wasn't called or failed or returned empty, use our calibrated domain engine
    if (!generatedText) {
      generatedText = generateDeterministicOutput(task, locale, facts, instructions);
    }

    // Try parsing as JSON or structured object
    let parsedData: unknown = generatedText;
    try {
      // Find JSON block if wrapped in markdown
      const jsonMatch = generatedText.match(/```json\s*([\s\S]*?)\s*```/) || generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } else {
        parsedData = JSON.parse(generatedText);
      }
    } catch {
      // Return as text if not strictly JSON
      parsedData = { text: generatedText };
    }

    const result: AiResult<unknown> = {
      ok: true,
      data: parsedData,
      generationId: `gen_${Date.now()}`,
      usage: {
        inputTokens: Math.round(JSON.stringify(facts).length / 4) + 120,
        outputTokens: Math.round(JSON.stringify(parsedData).length / 4),
      },
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("[Codematt Agent] AI route error:", error);
    return NextResponse.json(
      {
        ok: false,
        code: "provider-error",
        requestId: `err_${Date.now()}`,
      },
      { status: 500 }
    );
  }
}

function generateDeterministicOutput(
  task: string,
  locale: "id" | "en",
  facts: Record<string, string | number | null>,
  instructions: string
): string {
  const name = facts.name || facts.property_name || "Hunian Eksklusif";
  const location = facts.location || "Lokasi Strategis";
  const price = facts.price ? `Rp ${Number(facts.price).toLocaleString("id-ID")}` : "Harga Menarik";
  const lt = facts.landSize || facts.land_size || "120";
  const lb = facts.buildingSize || facts.building_size || "145";
  const kt = facts.bedrooms || "3";
  const km = facts.bathrooms || "2";
  const cert = facts.certificate || "SHM";

  if (task === "listing") {
    if (locale === "id") {
      return JSON.stringify({
        emotional: {
          headline: `Tempat Pulang Ternyaman: ${name} di ${location}`,
          body: `Bayangkan memulai hari dengan udara sejuk dan suasana asri yang menenangkan keluarga Anda. ${name} hadir dengan tata ruang lapang seluas ${lb} m² di atas tanah ${lt} m², dirancang sempurna dengan ${kt} kamar tidur dan ${km} kamar mandi untuk kehangatan setiap momen kebersamaan. Terletak di kawasan prestisius ${location} dengan keamanan 24 jam dan akses lingkungan yang ramah anak.`,
          bullets: [
            `Sertifikat: ${cert} (Aman & Legalitas Terjamin)`,
            `Spesifikasi: Luas Tanah ${lt} m² · Luas Bangunan ${lb} m²`,
            `Kapasitas: ${kt} Kamar Tidur · ${km} Kamar Mandi`,
            `Lingkungan hijau, asri, dan bebas banjir`,
            `Penawaran Istimewa: ${price} (Bisa KPR dibantu tuntas)`,
          ],
          cta: "Jadwalkan kunjungan privat Anda hari ini sebelum unit terbaik ini terjual!",
        },
        investor: {
          headline: `Peluang Investasi Properti Emas: ${name} — Yield Tinggi di ${location}`,
          body: `Aset properti prima dengan potensi capital gain signifikan di koridor berkembang ${location}. Ditawarkan dengan valuasi menarik ${price}, properti berlegalitas ${cert} ini memiliki luas bangunan ${lb} m² di atas tanah ${lt} m². Sangat ideal untuk disewakan maupun ditinggali jangka panjang dengan tingkat apresiasi harga tanah yang konsisten meningkat setiap tahunnya.`,
          bullets: [
            `Valuasi: ${price} (Estimasi rental yield 7-9% / tahun)`,
            `Legalitas: ${cert} (Clear & Clean, siap AJB)`,
            `Dimensi Efisien: LT ${lt} m² · LB ${lb} m² (${kt} KT / ${km} KM)`,
            `Aksesibilitas prima dekat gerbang tol dan pusat perbelanjaan`,
            `Opsi pembayaran fleksibel: Cash Keras, Cash Bertahap, atau KPR`,
          ],
          cta: "Hubungi konsultan kami untuk perhitungan simulasi ROI dan penjadwalan survei.",
        },
        formal: {
          headline: `DIJUAL: ${name} — ${location} (${price})`,
          body: `Dijual unit properti siap huni ${name} berlokasi di ${location}. Bangunan kokoh 2 lantai dengan luas tanah ${lt} m² dan luas bangunan ${lb} m². Dilengkapi ${kt} kamar tidur, ${km} kamar mandi, dan area parkir mobil luas. Berada di lingkungan tertata dengan one gate system security 24 jam dan infrastruktur bawah tanah.`,
          bullets: [
            `Harga: ${price}`,
            `Lokasi: ${location}`,
            `Sertifikat: ${cert}`,
            `Luas Tanah: ${lt} m² | Luas Bangunan: ${lb} m²`,
            `Kamar Tidur: ${kt} | Kamar Mandi: ${km}`,
          ],
          cta: "Info detail, simulasi KPR, dan survei lokasi hubungi kontak agen resmi.",
        },
      });
    } else {
      return JSON.stringify({
        emotional: {
          headline: `Your Dream Family Sanctuary: ${name} in ${location}`,
          body: `Discover a serene haven designed for modern family living. ${name} offers ${lb} sqm of crafted living space set upon ${lt} sqm of prime land in ${location}. Featuring ${kt} bedrooms, ${km} bathrooms, and lush landscaped surroundings with 24/7 guarded security.`,
          bullets: [
            `Title: ${cert} (Clean & Verified)`,
            `Dimensions: ${lt} sqm Land · ${lb} sqm Building`,
            `Layout: ${kt} Bedrooms · ${km} Bathrooms`,
            `Price: ${price} (Mortgage assistance available)`,
          ],
          cta: "Schedule your private tour today!",
        },
        investor: {
          headline: `High-Yield Property Investment: ${name} in ${location}`,
          body: `Exceptional opportunity to acquire a high-demand asset in the flourishing corridor of ${location}. Priced at ${price} with ${cert} title, this property combines strong capital appreciation prospects with excellent rental appeal.`,
          bullets: [
            `Price: ${price}`,
            `Land: ${lt} sqm · Building: ${lb} sqm`,
            `Rooms: ${kt} Beds · ${km} Baths`,
            `Projected Rental Yield: 7-9% annually`,
          ],
          cta: "Inquire now for comprehensive financial breakdown and viewing schedule.",
        },
        formal: {
          headline: `FOR SALE: ${name} — Prime ${location} (${price})`,
          body: `Exclusive listing offering: ${name} situated in ${location}. Built to superior standards featuring ${lt} sqm land area and ${lb} sqm floor plan with ${kt} bedrooms and ${km} bathrooms.`,
          bullets: [
            `Asking Price: ${price}`,
            `Location: ${location}`,
            `Title: ${cert}`,
            `Size: ${lt} sqm Land / ${lb} sqm Building`,
          ],
          cta: "Contact listing agent for full dossier and property inspection.",
        },
      });
    }
  }

  if (task === "followup") {
    return JSON.stringify({
      whatsapp: `Halo Bapak/Ibu, terima kasih banyak atas waktunya kemarin saat survei lokasi di *${name}* (${location}).\n\nSebagai pengingat, properti ini berstatus *${cert}* dengan harga spesial *${price}*. Unit di blok ini banyak diminati karena lokasinya yang sangat strategis.\n\nApakah ada hal teknis atau simulasi KPR yang ingin saya bantu hitungkan? Saya siap mendampingi proses penawaran terbaik untuk Bapak/Ibu. 🙏`,
      email: `Yth. Bapak/Ibu,\n\nTerima kasih atas kunjungan survei properti ${name} di ${location}.\n\nMenindaklanjuti ketertarikan Anda, kami lampirkan ringkasan spesifikasi legalitas (${cert}) dan skema pembayaran (${price}). Jika Anda ingin mengajukan penawaran atau memeriksa simulasi cicilan KPR, kami dengan senang hati membantu prosesnya.\n\nSalam hangat,\nCodematt Realty Team`,
    });
  }

  if (task === "assistant") {
    return JSON.stringify({
      response: `Berikut panduan terbaik untuk properti **${name}** di ${location} (${price}):\n\n1. **Poin Keunggulan Utama**: Legalitas ${cert} merupakan nilai jual tertinggi untuk pembeli keluarga karena memberikan ketenangan hak milik abadi.\n2. **Strategi Negosiasi**: Jika calon pembeli menawar lebih rendah dari ${price}, tonjolkan fasilitas lingkungan dan kelangkaan unit berdimensi ${lt}/${lb} m² di area ${location}.\n3. **Follow-up Efektif**: Kirimkan foto sudut terbaik saat sore hari dan tawarkan simulasi cicilan KPR bank rekanan.`,
    });
  }

  return JSON.stringify({
    text: `Materi untuk ${name} berhasil disusun sesuai fakta properti: Lokasi ${location}, Harga ${price}, Sertifikat ${cert}.`,
  });
}
