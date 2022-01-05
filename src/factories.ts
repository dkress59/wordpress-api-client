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

const contentRendered = { rendered: `<p>${faker.lorem.paragraph()}</p>` }

export const WPObjectLinksFactory =
	new FixtureFactory<WP_REST_API_Object_Links>(
		() => ({
			'predecessor-version': [
				{
					href: faker.internet.url(),
					id: faker.datatype.number(),
				},
			],
			'version-history': [
				{
					href: faker.internet.url(),
					id: faker.datatype.number(),
				},
			],
			'wp:attachment': [
				{
					href: faker.internet.url(),
					id: faker.datatype.number(),
				},
			],
			'wp:featuredmedia': [
				{
					href: faker.internet.url(),
					id: faker.datatype.number(),
				},
			],
			'wp:term': [
				{
					href: faker.internet.url(),
					id: faker.datatype.number(),
				},
			],
			'about': [
				{
					href: faker.internet.url(),
					id: faker.datatype.number(),
				},
			],
			'collection': [
				{
					href: faker.internet.url(),
					id: faker.datatype.number(),
				},
			],
			'counter': [
				{
					href: faker.internet.url(),
					id: faker.datatype.number(),
				},
			],
			'curies': [
				{
					href: faker.internet.url(),
					id: faker.datatype.number(),
				},
			],
		}),
		undefined,
		fixtureDir,
	)

export const WPPostFactory = new FixtureFactory<WPPost>(
	() => ({
		acf: undefined,
		author: faker.datatype.number(12),
		categories: [],
		comment_status: WP_Post_Comment_Status_Name.open,
		content: contentRendered,
		date_gmt: faker.date.recent(),
		date: faker.date.recent(),
		excerpt: contentRendered,
		featured_media: faker.datatype.number(123),
		format: 'standard',
		guid: faker.internet.url(),
		id: faker.datatype.number(2345),
		link: faker.internet.url(),
		menu_order: faker.datatype.number(20),
		meta: [],
		modified_gmt: faker.date.recent(),
		modified: faker.date.recent(),
		ping_status: WP_Post_Comment_Status_Name.open,
		slug: faker.random.word(),
		status: FixtureFactory.sample(POST_STATUS_MAP),
		sticky: false,
		tags: [],
		template: 'default.php',
		title: { rendered: faker.random.words() },
		type: WP_Post_Type_Name.post,
		yoastHead: `<meta title="${faker.random.words()}" />`,
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
		parent: FixtureFactory.sample([0, 0, faker.datatype.number()]),
	}),
	undefined,
	fixtureDir,
)

export const WPCategoryFactory = new FixtureFactory<WPCategory>(
	() => ({
		_links: WPObjectLinksFactory,
		acf: undefined,
		count: faker.datatype.number(12),
		description: faker.lorem.sentence(),
		id: faker.datatype.number(),
		link: faker.internet.url(),
		meta: [],
		name: faker.random.words(),
		slug: faker.random.words().replace(' ', '-').toLowerCase(),
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
		count: faker.datatype.number(12),
		description: faker.lorem.sentence(),
		id: faker.datatype.number(),
		link: faker.internet.url(),
		meta: [],
		name: faker.random.words(),
		slug: faker.random.words().replace(' ', '-').toLowerCase(),
		taxonomy: WP_Taxonomy_Name.post_tag,
	}),
	undefined,
	fixtureDir,
)
