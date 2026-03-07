import { NextRequest, NextResponse } from "next/server"

const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY
const TABLE_NAME = "Candidats"

function getHeaders() {
  return {
    Authorization: `Bearer ${AIRTABLE_API_KEY}`,
    "Content-Type": "application/json",
  }
}

export async function GET() {
  try {
    if (!AIRTABLE_BASE_ID || !AIRTABLE_API_KEY) {
      return NextResponse.json(
        { error: "Variables d'environnement Airtable manquantes" },
        { status: 500 }
      )
    }

    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(TABLE_NAME)}`,
      {
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        },
        cache: "no-store",
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.error || "Erreur Airtable" },
        { status: response.status }
      )
    }

    return NextResponse.json(data.records || [])
  } catch (error) {
    console.error("[api/candidates][GET] server error", error)

    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!AIRTABLE_BASE_ID || !AIRTABLE_API_KEY) {
      return NextResponse.json(
        { error: "Variables d'environnement Airtable manquantes" },
        { status: 500 }
      )
    }

    const body = await request.json()

    if (!body.nom || !body.prenom || !body.email) {
      return NextResponse.json(
        { error: "Champs obligatoires manquants" },
        { status: 400 }
      )
    }

    const fields = {
      Catégorie: body.category
        ? body.category.charAt(0).toUpperCase() + body.category.slice(1)
        : "",
      Nom: body.nom,
      Prénoms: body.prenom,
      Sexe: body.sexe || "",
      "Date de Naissance": body.dateNaissance || "",
      Nationalité: body.nationalite || "",
      Ville: body.ville || "",
      Téléphone: body.telephone || "",
      Email: body.email,
      Expérience: body.experience || "",
      Motivation: body.motivation || "",
      "Lien Vidéo": body.lienVideo || "",
      "Accepte Conditions": Boolean(body.acceptConditions),
      "Accepte Paiement": Boolean(body.acceptPaiement),
      Statut: "Nouveau",
    }

    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(TABLE_NAME)}`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          records: [{ fields }],
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.error || data || "Erreur Airtable" },
        { status: response.status }
      )
    }

    return NextResponse.json(
      { success: true, record: data.records?.[0] || null },
      { status: 201 }
    )
  } catch (error) {
    console.error("[api/candidates][POST] server error", error)

    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}