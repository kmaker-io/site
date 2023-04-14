import React from 'react';

import Research from '../../components/Research';
import { ISearchAPIResponse } from '../../lib/types';
import { fetchObject } from '../../lib/data';
import { SearchFacet } from '../../components/Search';
import LayoutFrame from '../../components/layout/LayoutFrame';
import { REVALIDATE_BASE, SEARCH_DATASET, SEARCH_SCHEMA } from '../../lib/constants';
import { Container, Row, Col } from '../../components/wrapped';
import { PageProps } from '../../components/utils/PageProps';
import { TITLE } from "./common";

import styles from '../../styles/Research.module.scss'

export const revalidate = REVALIDATE_BASE;

export default async function Page({ searchParams }: PageProps) {
  const params = {
    'limit': 0,
    'schema': SEARCH_SCHEMA
  };
  const response = await fetchObject<ISearchAPIResponse>(`/search/${SEARCH_DATASET}`, params);
  return (
    <LayoutFrame activeSection="research">
      <Research.Context title={TITLE} hidePrint>
        <Container>
          <Row className={styles.researchIntro}>
            <Col md={2}>
            </Col>
            <Col md={8}>
              <h3>Browse and search sanctions data</h3>
              <p>
                Use the research tool to search the OpenSanctions dataset, including
                sanctioned people and companies, policially exposed persons and
                wanted criminals from around the world.
              </p>
            </Col>
            <Col md={2}>
            </Col>
          </Row>
          {searchParams !== undefined && (
            <Row>
              <Col md={4}>
                <SearchFacet field="topics" facet={response.facets.topics} searchParams={searchParams} />
              </Col>
              <Col md={4}>
                <SearchFacet field="datasets" facet={response.facets.datasets} searchParams={searchParams} />
              </Col>
              <Col md={4}>
                <SearchFacet field="countries" facet={response.facets.countries} searchParams={searchParams} />
              </Col>
            </Row>
          )}
        </Container>
      </Research.Context >
    </LayoutFrame >
  )
}

