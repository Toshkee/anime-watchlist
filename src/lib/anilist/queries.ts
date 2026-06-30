/**
 * GraphQL documents for the AniList API.
 * Kept as plain strings (no codegen dependency) with a shared fragment so the
 * summary/detail selections stay in sync.
 */

const SUMMARY_FIELDS = /* GraphQL */ `
  id
  idMal
  title {
    romaji
    english
    native
  }
  coverImage {
    extraLarge
    large
    color
  }
  bannerImage
  format
  status
  episodes
  duration
  seasonYear
  averageScore
  genres
  isAdult
`;

export const SEARCH_QUERY = /* GraphQL */ `
  query SearchAnime(
    $search: String
    $page: Int = 1
    $perPage: Int = 24
    $sort: [MediaSort]
    $genre: String
    $season: MediaSeason
    $seasonYear: Int
    $format: MediaFormat
  ) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        total
        currentPage
        lastPage
        hasNextPage
        perPage
      }
      media(
        search: $search
        type: ANIME
        sort: $sort
        genre: $genre
        season: $season
        seasonYear: $seasonYear
        format: $format
        isAdult: false
      ) {
        ${SUMMARY_FIELDS}
      }
    }
  }
`;

export const DETAIL_QUERY = /* GraphQL */ `
  query AnimeDetail($id: Int) {
    Media(id: $id, type: ANIME) {
      ${SUMMARY_FIELDS}
      description(asHtml: false)
      season
      source
      popularity
      meanScore
      studios(isMain: true) {
        nodes {
          name
          isAnimationStudio
        }
      }
      tags {
        name
        rank
        isMediaSpoiler
      }
      nextAiringEpisode {
        episode
        airingAt
        timeUntilAiring
      }
      trailer {
        id
        site
      }
    }
  }
`;

export const TRENDING_QUERY = /* GraphQL */ `
  query Trending($page: Int = 1, $perPage: Int = 24) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        total
        currentPage
        lastPage
        hasNextPage
        perPage
      }
      media(type: ANIME, sort: TRENDING_DESC, isAdult: false) {
        ${SUMMARY_FIELDS}
      }
    }
  }
`;

export const SEASONAL_QUERY = /* GraphQL */ `
  query Seasonal(
    $season: MediaSeason
    $seasonYear: Int
    $page: Int = 1
    $perPage: Int = 24
  ) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        total
        currentPage
        lastPage
        hasNextPage
        perPage
      }
      media(
        type: ANIME
        season: $season
        seasonYear: $seasonYear
        sort: POPULARITY_DESC
        isAdult: false
      ) {
        ${SUMMARY_FIELDS}
      }
    }
  }
`;

export const AIRING_QUERY = /* GraphQL */ `
  query Airing($start: Int, $end: Int, $page: Int = 1) {
    Page(page: $page, perPage: 50) {
      pageInfo {
        hasNextPage
      }
      airingSchedules(
        airingAt_greater: $start
        airingAt_lesser: $end
        sort: TIME
      ) {
        id
        episode
        airingAt
        media {
          ${SUMMARY_FIELDS}
        }
      }
    }
  }
`;
