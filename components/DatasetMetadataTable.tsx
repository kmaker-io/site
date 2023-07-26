import Link from 'next/link';

import { Badge, Table } from "./wrapped";
import { IDataset, ICollection, isSource, isExternal, IIssue, LEVEL_ERROR, LEVEL_WARNING } from '../lib/types';
import { FormattedDate, HelpLink, Numeric, Plural, Spacer, UnofficialBadge, URLLink } from './util';
import { wordList } from '../lib/util';

import styles from '../styles/Dataset.module.scss';
import DatasetCountryListing from './DatasetCountryListing';


type DatasetScreenProps = {
  dataset: IDataset
  issues: Array<IIssue>
  collections?: Array<ICollection>
}

export default function DatasetMetadataTable({ dataset, collections, issues }: DatasetScreenProps) {
  const errors = issues.filter((i) => i.level === LEVEL_ERROR);
  const warnings = issues.filter((i) => i.level === LEVEL_WARNING);
  return (
    <Table responsive="md">
      <tbody>
        <tr>
          <th className={styles.tableHeader}>
            Entity count:
          </th>
          <td>
            {dataset.target_count > 0 && (
              <>
                <Plural
                  value={dataset.target_count}
                  one={"target entity"}
                  many={"target entities"}
                />
                <HelpLink href="/reference/#targets" />
                <Spacer />
              </>
            )}
            {dataset.things.total > 0 && (
              <>
                <a href={`/search/?scope=${dataset.name}`}>
                  <Plural value={dataset.things.total}
                    one={"searchable entity"}
                    many={"searchable entities"}
                  />
                </a>
                <Spacer />
              </>
            )}
            <Plural
              value={dataset.entity_count}
              one={"total"}
              many={"total"}
            />
          </td>
        </tr>
        {dataset.things.schemata.length > 0 && (
          <tr>
            <th className={styles.tableHeader}>
              Entity types:
            </th>
            <td className="contains-inner-table">
              <Table size="sm" className="inner-table">
                <tbody>
                  {dataset.things.schemata.map((ts) =>
                    <tr key={ts.name}>
                      <td>
                        <a href={`/search/?scope=${dataset.name}&schema=${ts.name}`}>
                          <Plural one={ts.label} many={ts.plural} />
                        </a>
                        <HelpLink href={`/reference/#schema.${ts.name}`} />
                      </td>
                      <td className="numeric">
                        <Numeric value={ts.count} />
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </td>
          </tr>
        )}
        {dataset.things.countries.length > 0 && (
          <tr>
            <th className={styles.tableHeader}>
              Coverage:
            </th>
            <td className="contains-inner-table">
              <DatasetCountryListing countries={dataset.things.countries} datasetName={dataset.name} />
            </td>
          </tr>
        )}
        {(isSource(dataset) || isExternal(dataset)) && (
          <tr>
            <th className={styles.tableHeader}>Publisher:</th>
            <td>
              {dataset.publisher.logo_url &&
                <img src={dataset.publisher.logo_url} className={styles.publisherLogo} />}
              <URLLink url={dataset.publisher.url} label={dataset.publisher.name} icon={false} />
              {!!dataset.publisher.country && (
                <> ({dataset.publisher.country_label})</>
              )}
              {!dataset.publisher.official && (
                <>{' '} <UnofficialBadge /></>
              )}
              <p className={styles.publisherDescription}>{dataset.publisher.description}</p>

            </td>
          </tr>
        )}
        {(isSource(dataset) || isExternal(dataset)) && !!dataset.url && (
          <tr>
            <th className={styles.tableHeader}>Information:</th>
            <td>
              <URLLink url={dataset.url} />
            </td>
          </tr>
        )}
        {isSource(dataset) && dataset.data.url && (
          <tr>
            <th className={styles.tableHeader}>Source data:</th>
            <td>
              <URLLink url={dataset.data.url} />
              <> ({dataset.data.format})</>
            </td>
          </tr>
        )}
        {(isSource(dataset) || isExternal(dataset)) && !!collections?.length && (
          <tr>
            <th className={styles.tableHeader}>
              Collections<HelpLink href="/docs/faq/#collections" />:
            </th>
            <td>
              <>in </>
              {wordList(collections.map((collection) =>
                <Link href={collection.link}>
                  {collection.title}
                </Link>
              ), <Spacer />)}
            </td>
          </tr>
        )}
        {(isSource(dataset) || isExternal(dataset)) && !!issues?.length && (
          <tr>
            <th className={styles.tableHeader}>Issues:</th>
            <td>
              {errors.length > 0 && (
                <>
                  <Badge bg='danger'>
                    <Plural value={errors.length} one="Error" many="Errors" />
                  </Badge>
                  <Spacer />
                </>
              )}
              {warnings.length > 0 && (
                <>
                  <Badge bg='warning'>
                    <Plural value={warnings.length} one="Warning" many="Warnings" />
                  </Badge>
                  <Spacer />
                </>
              )}
              <Link href={`/issues/${dataset.name}/`}>See details...</Link>
            </td>
          </tr>
        )}
        <tr>
          <th className={styles.tableHeader}>Last changed<HelpLink href="/docs/bulk/faq/#updates" />:</th>
          <td><FormattedDate date={dataset.last_change} /></td>
        </tr>
      </tbody>
    </Table >

  )
}
