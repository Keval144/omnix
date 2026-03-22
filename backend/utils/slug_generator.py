import random

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.project import Project

_ADJECTIVES = [
    "silent", "quantum", "cosmic", "ember", "lunar", "solar", "silver", "golden", "rapid", "gentle",
    "hidden", "crimson", "frozen", "electric", "cobalt", "scarlet", "velvet", "orbital", "neural", "tidal",
]
_NOUNS = [
    "ocean", "mango", "apple", "forest", "harbor", "summit", "meadow", "canyon", "tiger", "falcon",
    "vector", "engine", "signal", "matrix", "lake", "sky", "river", "planet", "comet", "bridge",
]


def _build_slug() -> str:
    return "-".join(random.sample(_ADJECTIVES, 2) + random.sample(_NOUNS, 2))


async def generate_project_slug(session: AsyncSession, batch_size: int = 10) -> str:
    existing_slugs = set((await session.scalars(select(Project.project_slug))).all())
    while True:
        candidates = [_build_slug() for _ in range(batch_size)]
        available = [c for c in candidates if c not in existing_slugs]
        if available:
            return available[0]
        existing_slugs.update(candidates)
