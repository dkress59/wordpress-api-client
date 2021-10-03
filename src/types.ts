export enum WPPostStatus {
    PUBLISH = 'publish',
    DRAFT = 'draft',
    PRIVATE = 'private',
    PENDING = 'pending',
    FUTURE = 'future',
}

export interface WPMediaSize {
    file: string // filename
    width: number
    height: number
    mime_type: string | 'image/jpeg' | 'image/jeg' | 'image/png'
    source_url: string
}

export interface WPMetaLink {
    embeddable?: boolean
    href: string
}

export interface WPMetaEmbed {
    'wp:featuredmedia': [
        {
            id: number
            date: string
            slug: string
            type: string
            link: string
            title: {
                rendered: string
            }
            author: number
            acf: unknown
            caption: {
                rendered: string
            }
            alt_text: string
            media_type: string
            mime_type: string
            media_details: {
                width: number
                height: number
                file: string
                sizes: {
                    'medium': WPMediaSize
                    'large': WPMediaSize
                    'thumbnail': WPMediaSize
                    'medium_large': WPMediaSize
                    '1536x1536': WPMediaSize
                    '2048x2048': WPMediaSize
                    'full': WPMediaSize
                }
                image_meta: {
                    aperture: string
                    credit: string
                    camera: string
                    caption: string
                    created_timestamp: string
                    copyright: string
                    focal_length: string
                    iso: string
                    shutter_speed: string
                    title: string
                    orientation: string
                    keywords: []
                }
                original_image: string
            }
            source_url: string
            _links: {
                self: WPMetaLink[]
                collection: WPMetaLink[]
                about: WPMetaLink[]
                author: WPMetaLink[]
                replies: WPMetaLink[]
            }
        },
    ]
}

export interface WPPost {
    id: number
    categories: number[]
    date: string
    date_gmt: string
    guid: {
        rendered: string
    }
    modified: string
    modified_gmt: string
    slug: string
    status: WPPostStatus
    type: string
    link: string
    title: {
        rendered: string
    }
    content: {
        rendered: string
        protected: boolean
    }
    featured_media: number
    menu_order: number
    tags: number[]
    template: string
    yoastHead: string
    _links: {
        'self': { href: string }[]
        'collection': { href: string }[]
        'about': { href: string }[]
        'version-history': {
            count: number
            href: string
        }[]
        'predecessor-version': {
            id: number
            href: string
        }[]
        'wp:featuredmedia': {
            embeddable: boolean
            href: string
        }[]
        'wp:attachment': { href: string }[]
        'wp:term': {
            taxonomy: string
            embeddable: boolean
            href: string
        }[]
        'curies': {
            name: string
            href: string
            templated: boolean
        }[]
    }
    _embedded?: WPMetaEmbed
}

export interface WPPage extends Omit<Omit<WPPost, 'categories'>, 'tags'> {
    parent: number
}

export type PickRename<T, K extends keyof T, R extends PropertyKey> = Omit<
    T,
    K
> & { [P in R]: T[K] }

export type WPCreate<W> = Record<string, unknown> &
    Partial<
        { content: string; title: string } & Omit<
            Omit<Omit<W, 'id'>, 'content'>,
            'title'
        >
    >

export type EndpointCreate<P> = (body: WPCreate<P>) => Promise<P | null>
export type EndpointUpdate<P> = (
    body: WPCreate<P>,
    id: number,
) => Promise<P | null>
