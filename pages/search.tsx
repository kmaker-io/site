import React, { FormEvent, MouseEvent, useState } from 'react';
import { Entity, Model } from '@alephdata/followthemoney';
import { useRouter } from 'next/router'
import Link from 'next/link';
import useSWR from 'swr';
import queryString from 'query-string';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';
import Container from 'react-bootstrap/Container';

import Layout from '../components/Layout'
import { IOpenSanctionsEntity, ISearchAPIResponse } from '../lib/types';
import { fetchIndex, getDatasets } from '../lib/data';
import { GetStaticPropsContext, InferGetStaticPropsType } from 'next';
import { SearchEntityModal, SearchFacet, SearchPagination } from '../components/Search';
import styles from '../styles/Search.module.scss'
import { swrFetcher } from '../lib/util';
import { API_URL, SEARCH_DATASET } from '../lib/constants';
import { SectionSpinner } from '../components/util';

const SUMMARY = "Provide a search term to search across sanctions lists and other persons of interest.";

export default function Search({ modelData, datasets }: InferGetStaticPropsType<typeof getStaticProps>) {
  const model = new Model(modelData);
  const router = useRouter();
  const [query, setQuery] = useState<string | null>(null);
  const realQuery = query === null ? router.query.q || '' : query;
  const apiUrl = queryString.stringifyUrl({
    'url': `${API_URL}/search/${SEARCH_DATASET}`,
    'query': {
      'q': router.query.q,
      'limit': 25,
      'offset': router.query.offset || 0,
      'schema': 'Thing'
    }
  })
  const { data, error } = useSWR(apiUrl, swrFetcher)
  const response = data ? data as ISearchAPIResponse : undefined
  const isLoading = !data && !error;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    router.push({ query: { q: realQuery, offset: 0 } });
  }

  const handleClickEntity = (e: MouseEvent<HTMLElement>, entity: IOpenSanctionsEntity) => {
    e.preventDefault()
    router.push({ query: { ...router.query, entity: entity.id } });
  }

  return (
    <Layout.Base title="Search" description={SUMMARY} >
      {router.query.entity && (
        <SearchEntityModal
          entityId={router.query.entity as string}
          datasets={datasets}
          model={model}
        />
      )}
      <Container>
        <Row>
          <Col md={8}>
            <h1>Search the OpenSanctions database</h1>
            <Form onSubmit={handleSubmit}>
              <Form.Control
                name="q"
                value={realQuery}
                size="lg"
                type="text"
                onChange={(e) => setQuery(e.target.value)}
                className={styles.searchBox}
                placeholder="Search people, companies and other entities of interest..."
              />
            </Form>
          </Col>
        </Row>
        <Row>
          <Col md={8}>
            {isLoading && (
              <SectionSpinner />
            )}
            {response && response.results && (
              <>
                <ul>
                  {response.results.map((r) => (
                    <li key={r.id}>
                      <a onClick={(e) => handleClickEntity(e, r)} href={`#${r.id}`}>
                        {r.caption} [{r.schema}]
                      </a>
                    </li>
                  ))}
                </ul>
                <SearchPagination response={response} />
              </>
            )}
          </Col>
          <Col md={4}>
            {response && response.facets && response.total > 0 && (
              <>
                <SearchFacet facet={response.facets.topics} />
                <SearchFacet facet={response.facets.datasets} />
                <SearchFacet facet={response.facets.countries} />
              </>
            )}
          </Col>
        </Row>
      </Container>
    </Layout.Base >
  )
}


export const getStaticProps = async (context: GetStaticPropsContext) => {
  const index = await fetchIndex();
  return {
    props: {
      datasets: await getDatasets(),
      modelData: index.model
    }
  };
}
