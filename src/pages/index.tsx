import clsx from 'clsx';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import styles from './index.module.css';

export default function Home(): JSX.Element {
 const {siteConfig} = useDocusaurusContext();
 return <Layout title={siteConfig.title} description="A fictional venue guide used to demonstrate a CMS and documentation site."><header className={clsx('hero hero--primary', styles.heroBanner)}><div className="container"><Heading as="h1" className="hero__title">{siteConfig.title}</Heading><p className="hero__subtitle">A multilingual venue guide managed with {String(siteConfig.customFields?.cmsName ?? "CMS")}.</p><a className="button button--secondary button--lg" href="/docs/">Browse the guide</a></div></header><main><HomepageFeatures/></main></Layout>;
}
