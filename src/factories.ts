import { FixtureFactory } from 'interface-forge'
import { WPCategory, WPPage, WPPost, WPTag } from './types'
import {
	WP_Post_Comment_Status_Name,
	WP_Post_Status_Name,
	WP_Post_Type_Name,
	WP_REST_API_Object_Links,
	WP_Taxonomy_Name,
} from 'wp-types'
import faker from 'faker'
import path from 'path'

const fixtureDir = path.resolve(__dirname, '../../test')

export const POST_STATUS_MAP = [
	WP_Post_Status_Name.auto_draft,
	WP_Post_Status_Name.draft,
	WP_Post_Status_Name.future,
	WP_Post_Status_Name.inherit,
	WP_Post_Status_Name.pending,
	WP_Post_Status_Name.private,
	WP_Post_Status_Name.publish,
	WP_Post_Status_Name.trash,
]

export const POST_TYPE_MAP = [
	WP_Post_Type_Name.attachment,
	WP_Post_Type_Name.custom_css,
	WP_Post_Type_Name.customize_changeset,
	WP_Post_Type_Name.nav_menu_item,
	WP_Post_Type_Name.oembed_cache,
	WP_Post_Type_Name.page,
	WP_Post_Type_Name.post,
	WP_Post_Type_Name.revision,
	WP_Post_Type_Name.user_request,
	WP_Post_Type_Name.wp_block,
]

function fakeUrl() {
	return faker.internet.url()
}

function fakeNumber(max?: number) {
	return faker.datatype.number(max)
}

function recentDate() {
	return faker.date.recent()
}

function randomWord() {
	return faker.random.word()
}

function randomWords() {
	return faker.random.words()
}

function fakeSentence() {
	return faker.lorem.sentence()
}

const contentRendered = { rendered: `<p>${faker.lorem.paragraph()}</p>` }

export const WPObjectLinksFactory =
	new FixtureFactory<WP_REST_API_Object_Links>(
		() => ({
			'predecessor-version': [
				{
					href: fakeUrl(),
					id: fakeNumber(),
				},
			],
			'version-history': [
				{
					href: fakeUrl(),
					id: fakeNumber(),
				},
			],
			'wp:attachment': [
				{
					href: fakeUrl(),
					id: fakeNumber(),
				},
			],
			'wp:featuredmedia': [
				{
					href: fakeUrl(),
					id: fakeNumber(),
				},
			],
			'wp:term': [
				{
					href: fakeUrl(),
					id: fakeNumber(),
				},
			],
			'about': [
				{
					href: fakeUrl(),
					id: fakeNumber(),
				},
			],
			'collection': [
				{
					href: fakeUrl(),
					id: fakeNumber(),
				},
			],
			'counter': [
				{
					href: fakeUrl(),
					id: fakeNumber(),
				},
			],
			'curies': [
				{
					href: fakeUrl(),
					id: fakeNumber(),
				},
			],
		}),
		undefined,
		fixtureDir,
	)

export const WPPostFactory = new FixtureFactory<WPPost>(
	() => ({
		acf: undefined,
		author: fakeNumber(12),
		categories: [],
		comment_status: WP_Post_Comment_Status_Name.open,
		content: contentRendered,
		date_gmt: recentDate(),
		date: recentDate(),
		excerpt: contentRendered,
		featured_media: fakeNumber(123),
		format: 'standard',
		guid: fakeUrl(),
		id: fakeNumber(2345),
		link: fakeUrl(),
		menu_order: fakeNumber(20),
		meta: [],
		modified_gmt: recentDate(),
		modified: recentDate(),
		ping_status: WP_Post_Comment_Status_Name.open,
		slug: randomWord(),
		status: FixtureFactory.sample(POST_STATUS_MAP),
		sticky: false,
		tags: [],
		template: 'default.php',
		title: { rendered: randomWords() },
		type: WP_Post_Type_Name.post,
		yoastHead: `<meta title="${randomWords()}" />`,
		_links: WPObjectLinksFactory,
	}),
	undefined,
	fixtureDir,
)

export const WPPageFactory = new FixtureFactory<WPPage>(
	() => ({
		...WPPostFactory.buildSync(),
		type: WP_Post_Type_Name.page,
		menu_order: 0,
		parent: FixtureFactory.sample([0, 0, fakeNumber()]),
	}),
	undefined,
	fixtureDir,
)

export const WPCategoryFactory = new FixtureFactory<WPCategory>(
	() => ({
		_links: WPObjectLinksFactory,
		acf: undefined,
		count: fakeNumber(12),
		description: fakeSentence(),
		id: fakeNumber(),
		link: fakeUrl(),
		meta: [],
		name: randomWords(),
		slug: randomWords().replace(' ', '-').toLowerCase(),
		taxonomy: WP_Taxonomy_Name.category,
		parent: 0,
	}),
	undefined,
	fixtureDir,
)

export const WPTagFactory = new FixtureFactory<WPTag>(
	() => ({
		_links: WPObjectLinksFactory,
		acf: undefined,
		count: fakeNumber(12),
		description: fakeSentence(),
		id: fakeNumber(),
		link: fakeUrl(),
		meta: [],
		name: randomWords(),
		slug: randomWords().replace(' ', '-').toLowerCase(),
		taxonomy: WP_Taxonomy_Name.post_tag,
	}),
	undefined,
	fixtureDir,
)
