import faker from 'faker'

import { WPObjectLinksFactory } from './factories/object-links.factory'

export const mockStatusText = 'Mock Server Error'

export const mockResponse = (error: unknown) => {
	return {
		json: () => error,
		text: () => String(error),
		status: 666,
		statusText: mockStatusText,
	} as unknown as Response
}

export const defaultOptions = {
	body: undefined,
	headers: {
		'Accept': 'application/json',
		'Content-Type': 'application/json',
	},
	method: 'get',
}

export const fakeUrl = () => faker.internet.url()
export const fakeNumber = (max?: number) => faker.datatype.number(max)
export const recentDate = () => faker.date.recent()
export const randomWords = () => faker.random.words()
export const fakeSentence = () => faker.lorem.sentence()
export const contentRendered = { rendered: `<p>${faker.lorem.paragraph()}</p>` }
export const fakeObjectLink = () => ({
	href: fakeUrl(),
	id: fakeNumber(),
})
export const fakeBase = () => ({
	_links: WPObjectLinksFactory,
	acf: undefined,
	id: fakeNumber(),
	link: fakeUrl(),
	meta: [],
	slug: randomWords().replace(' ', '-').toLowerCase(),
})
export const fakeTaxonomy = () => ({
	...fakeBase(),
	count: fakeNumber(12),
	description: fakeSentence(),
	name: randomWords(),
})
