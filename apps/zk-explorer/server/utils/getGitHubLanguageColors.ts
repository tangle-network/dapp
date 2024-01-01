import { GITHUB_LANGUAGE_COLORS_API_URL } from '../../constants';

export default async function getGitHubLanguageColors(
  colorList: string[]
): Promise<Record<string, string>> {
  const res = await fetch(GITHUB_LANGUAGE_COLORS_API_URL);

  if (!res.ok) {
    throw new Error('Failed to fetch GitHub language colors');
  }

  const formattedRes = await res.json();
  const filteredData = Object.keys(formattedRes).filter((color) =>
    colorList.includes(color)
  );

  return filteredData.reduce((map, language) => {
    const updatedMap = map;
    map[language] = formattedRes[language].color;
    return updatedMap;
  }, {} as Record<string, string>);
}
