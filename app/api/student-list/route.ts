import { NextResponse } from "next/server"
import { generateSampleData, getStudentList } from "@/lib/analytics"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Get sample events
    const sampleEvents = generateSampleData()
    
    // Extract unique students
    const students = getStudentList(sampleEvents)

    return NextResponse.json({
      success: true,
      students,
      total: students.length,
    })
  } catch (error) {
    console.error("[Student List API] Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch student list" },
      { status: 500 }
    )
  }
}
