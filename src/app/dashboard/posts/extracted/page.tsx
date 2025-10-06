"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { PostFilters } from "@/components/extracted/PostFilters"
import { PostTable } from "@/components/extracted/PostTable"

export default function ExtractedPostsPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch("/api/posts/extracted")
        const data = await res.json()
        console.log("DATA:", data)
        setPosts(data.posts)
      } catch (error) {
        console.error("Error al cargar posts:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <Card className="border-0 shadow-none">
        <CardHeader>
          <CardTitle>📡 Publicaciones Extraídas</CardTitle>
        </CardHeader>
        <CardContent>
          <PostFilters />
          <Separator className="my-4" />
          {loading ? (
            <p className="text-center text-muted-foreground">Cargando publicaciones...</p>
          ) : posts.length > 0 ? (
            <PostTable posts={posts} />
          ) : (
            <p className="text-center text-muted-foreground">No hay publicaciones registradas.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
