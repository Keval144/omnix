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


async def generate_project_slug(session: AsyncSession, max_attempts: int = 20) -> str:
    for _ in range(max_attempts):
        candidate = _build_slug()
        exists = await session.scalar(select(Project.project_id).where(Project.project_slug == candidate).limit(1))
        if not exists:
            return candidate
    raise RuntimeError("Could not generate a unique project slug")
