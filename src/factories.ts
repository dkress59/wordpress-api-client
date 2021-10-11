import { ACFMedia, WPPage, WPPost } from './types'
import { FixtureFactory } from 'interface-forge'
import {
	WP_Post_Comment_Status_Name,
	WP_Post_Status_Name,
	WP_Post_Type_Name,
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

export const AcfMediaFactory = new FixtureFactory<ACFMedia>(
	() => ({
		ID: faker.datatype.number(),
		alt: faker.lorem.sentence(),
		author: faker.datatype.number().toString(),
		caption: faker.lorem.sentence(),
		date: faker.date.recent(),
		modified: faker.date.recent(),
		description: faker.lorem.sentence(),
		filename: faker.system.fileName() + '.' + faker.system.fileExt(),
		filesize: faker.datatype.number(),
		url: faker.internet.url(),
		id: faker.datatype.number(),
		mime_type: faker.system.mimeType(),
		name: faker.random.words(),
		title: faker.random.words(),
		status: FixtureFactory.sample(POST_STATUS_MAP),
		link: faker.internet.url(),
		menu_order: faker.datatype.number(),
		uploaded_to: faker.datatype.number(),
		icon: faker.random.word(),
		width: faker.datatype.number(4096),
		height: faker.datatype.number(4096),
		type: FixtureFactory.sample(['image', 'video']),
		subtype: FixtureFactory.sample(['jpeg', 'png', 'mp4']),
		sizes: {
			'thumbnail':
				faker.datatype.number(4096).toString() +
				'x' +
				faker.datatype.number(4096).toString(),
			'thumbnail-width': faker.datatype.number(4096),
			'thumbnail-height': faker.datatype.number(4096),
			'medium':
				faker.datatype.number(4096).toString() +
				'x' +
				faker.datatype.number(4096).toString(),
			'medium-width': faker.datatype.number(4096),
			'medium-height': faker.datatype.number(4096),
			'medium_large':
				faker.datatype.number(4096).toString() +
				'x' +
				faker.datatype.number(4096).toString(),
			'medium_large-width': faker.datatype.number(4096),
			'medium_large-height': faker.datatype.number(4096),
			'large':
				faker.datatype.number(4096).toString() +
				'x' +
				faker.datatype.number(4096).toString(),
			'large-width': faker.datatype.number(4096),
			'large-height': faker.datatype.number(4096),
			'1536x1536':
				faker.datatype.number(4096).toString() +
				'x' +
				faker.datatype.number(4096).toString(),
			'1536x1536-width': faker.datatype.number(4096),
			'1536x1536-height': faker.datatype.number(4096),
			'2048x2048':
				faker.datatype.number(4096).toString() +
				'x' +
				faker.datatype.number(4096).toString(),
			'2048x2048-width': faker.datatype.number(4096),
			'2048x2048-height': faker.datatype.number(4096),
		},
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
		content: { rendered: '<p>' + faker.lorem.paragraph() + '</p>' },
		date_gmt: faker.date.recent(),
		date: faker.date.recent(),
		excerpt: { rendered: '<p>' + faker.lorem.paragraph() + '</p>' },
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
		yoastHead: '<meta title="' + faker.random.words() + '" />',
		_links: {
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
		},
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
