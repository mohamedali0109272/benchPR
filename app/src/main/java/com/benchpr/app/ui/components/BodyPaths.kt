package com.benchpr.app.ui.components

import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.vector.PathParser
import com.benchpr.app.data.model.MuscleGroup

/**
 * Vector outlines of the body model in a 200 x 420 coordinate space. Only the left half of the
 * body is described; the drawing code mirrors it around x = 100 for the right half.
 * The path data was previewed as SVG before being ported here.
 */
object BodyPaths {
    const val WIDTH = 200f
    const val HEIGHT = 420f
    const val MIRROR_X = 100f

    class Part(val muscle: MuscleGroup, val path: Path)

    private fun path(data: String): Path = PathParser().parsePathString(data).toPath()

    val silhouette: Path by lazy {
        path("M100 48 L93 48 L93 62 C80 64 62 66 52 72 C44 76 42 88 42 100 C42 120 42 138 40 156 C38 172 36 190 34 206 C32 214 30 224 32 232 L46 234 C48 222 52 210 54 200 C56 186 60 168 62 150 C64 136 64 124 64 112 C66 130 76 150 78 168 C78 180 72 190 72 204 C70 230 68 260 70 284 C70 296 66 316 68 336 C70 352 72 364 76 374 L74 392 C70 396 64 400 64 406 L88 406 C90 400 92 394 92 386 C94 370 94 340 94 316 C96 300 96 290 96 282 C98 260 100 232 100 212 Z")
    }

    val front: List<Part> by lazy {
        listOf(
        Part(MuscleGroup.TRAPS, path("M92 62 C84 64 74 68 64 71 C72 78 82 80 92 78 Z")),
        Part(MuscleGroup.SHOULDERS, path("M64 71 C54 73 44 80 42 96 C42 106 46 112 52 114 C58 106 62 96 66 86 C68 80 66 76 64 71 Z")),
        Part(MuscleGroup.CHEST, path("M96 79 C88 79 78 79 68 83 C64 92 62 104 66 110 C74 116 88 116 96 112 Z")),
        Part(MuscleGroup.BICEPS, path("M47 118 C44 128 43 140 44 152 C49 156 58 156 62 152 C65 140 65 126 63 114 C58 112 51 112 47 118 Z")),
        Part(MuscleGroup.FOREARMS, path("M44 158 C42 172 38 190 36 204 C40 208 48 208 52 204 C56 190 60 172 62 158 C56 160 50 160 44 158 Z")),
        Part(MuscleGroup.CORE, path("M96 118 C88 118 78 118 70 114 C70 132 74 150 78 168 C84 178 92 184 96 186 Z")),
        Part(MuscleGroup.QUADS, path("M97 208 C88 208 78 204 72 204 C69 230 68 262 70 282 C76 292 88 292 95 286 C98 262 98 236 97 208 Z")),
        Part(MuscleGroup.CALVES, path("M70 298 C68 318 68 340 74 366 C80 372 86 370 90 364 C94 344 94 322 92 298 C86 302 78 302 70 298 Z"))
        )
    }

    val back: List<Part> by lazy {
        listOf(
        Part(MuscleGroup.TRAPS, path("M96 60 C88 62 78 66 64 71 C72 86 88 100 96 114 Z")),
        Part(MuscleGroup.SHOULDERS, path("M64 71 C54 73 44 80 42 96 C42 106 46 112 52 114 C58 106 62 96 66 86 C68 80 66 76 64 71 Z")),
        Part(MuscleGroup.LATS, path("M66 88 C74 96 88 108 96 118 L96 146 C88 150 80 156 74 160 C68 142 64 120 66 102 C66 96 66 92 66 88 Z")),
        Part(MuscleGroup.TRICEPS, path("M47 116 C44 128 43 142 44 154 C49 158 58 158 62 154 C66 140 66 124 63 112 C58 108 51 110 47 116 Z")),
        Part(MuscleGroup.FOREARMS, path("M44 160 C42 174 38 190 36 204 C40 208 48 208 52 204 C56 190 60 174 62 160 C56 162 50 162 44 160 Z")),
        Part(MuscleGroup.LOWER_BACK, path("M96 148 C88 150 82 154 76 160 C76 172 86 184 96 190 Z")),
        Part(MuscleGroup.GLUTES, path("M96 192 C86 190 74 192 71 204 C71 218 82 228 96 228 Z")),
        Part(MuscleGroup.HAMSTRINGS, path("M97 232 C88 232 78 228 71 220 C68 240 68 264 70 282 C76 292 88 292 95 286 C98 266 98 250 97 232 Z")),
        Part(MuscleGroup.CALVES, path("M70 296 C66 316 68 342 74 364 C80 370 86 368 90 362 C94 344 94 320 92 296 C86 300 76 300 70 296 Z"))
        )
    }

    val frontDetails: List<Path> by lazy {
        listOf(
        path("M80 134 L96 134"),
        path("M78 150 L96 150"),
        path("M81 166 L96 166"),
        path("M84 122 C82 140 82 156 85 172"),
        path("M84 214 C82 240 82 262 84 284"),
        path("M82 306 C82 330 82 350 83 364"),
        path("M74 102 C82 108 90 110 96 108")
        )
    }

    val backDetails: List<Path> by lazy {
        listOf(
        path("M84 236 C82 256 82 270 84 284"),
        path("M82 304 C82 330 82 350 83 362"),
        path("M100 118 L100 190")
        )
    }
}
