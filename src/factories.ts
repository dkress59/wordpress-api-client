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

const fakeUrl = () => faker.internet.url()
const fakeNumber = (max?: number) => faker.datatype.number(max)
const recentDate = () => faker.date.recent()
const randomWords = () => faker.random.words()
const fakeSentence = () => faker.lorem.sentence()
const contentRendered = { rendered: `<p>${faker.lorem.paragraph()}</p>` }
const fakeObjectLink = () => ({
	href: fakeUrl(),
	id: fakeNumber(),
})
const fakeBase = () => ({
	_links: WPObjectLinksFactory,
	acf: undefined,
	id: fakeNumber(),
	link: fakeUrl(),
	meta: [],
	slug: randomWords().replace(' ', '-').toLowerCase(),
})
const fakeTaxonomy = () => ({
	...fakeBase(),
	count: fakeNumber(12),
	description: fakeSentence(),
	name: randomWords(),
})

export const WPObjectLinksFactory =
	new FixtureFactory<WP_REST_API_Object_Links>(
		() => ({
			'predecessor-version': [fakeObjectLink],
			'version-history': [fakeObjectLink],
			'wp:attachment': [fakeObjectLink],
			'wp:featuredmedia': [fakeObjectLink],
			'wp:term': [fakeObjectLink],
			'about': [fakeObjectLink],
			'collection': [fakeObjectLink],
			'counter': [fakeObjectLink],
			'curies': [fakeObjectLink],
		}),
		undefined,
		fixtureDir,
	)

export const WPPostFactory = new FixtureFactory<WPPost>(
	() => ({
		...fakeBase(),
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
		menu_order: fakeNumber(20),
		modified_gmt: recentDate(),
		modified: recentDate(),
		ping_status: WP_Post_Comment_Status_Name.open,
		status: FixtureFactory.sample(POST_STATUS_MAP),
		sticky: false,
		tags: [],
		template: 'default.php',
		title: { rendered: randomWords() },
		type: WP_Post_Type_Name.post,
		yoastHead: `<meta title="${randomWords()}" />`,
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
		...fakeTaxonomy(),
		taxonomy: WP_Taxonomy_Name.category,
		parent: FixtureFactory.sample([0, 0, fakeNumber()]),
	}),
	undefined,
	fixtureDir,
)

export const WPTagFactory = new FixtureFactory<WPTag>(
	() => ({
		...fakeTaxonomy(),
		taxonomy: WP_Taxonomy_Name.post_tag,
	}),
	undefined,
	fixtureDir,
)
