import React from 'react'
import ZipFinder from './ZipFinder'

describe('<ZipFinder />', () => {

  beforeEach(()=> {
    cy.mount(<ZipFinder />)

    cy.viewport(1200,768)

    cy.get('[data-cy=inputCep]').as('inputCep')
    cy.get('[data-cy=submitCep]').as('submitCep')
  })

  it('deve buscar um cep na área de cobertura', () => {
    
    const address = {
      street: 'Rua Joaquim Floriano',
      district: 'Itaim Bibi',
      city: 'São Paulo/SP',
      zipcode: '04534-011'
    }

    cy.zipFind(address,true)


    cy.get('[data-cy=street]')
      .should('have.text', address.street)

    cy.get('[data-cy=district]')
      .should('have.text', address.district)

    cy.get('[data-cy=city]')
      .should('have.text', address.city)

    cy.get('[data-cy=zipcode]')
      .should('have.text', address.zipcode)

  })

  it('cep de ve ser obrigatório', ()=> {
    cy.get('@submitCep').click()

    // Usar para descobrir elelemntos, mas não é uma boa prática usar ele na automação.
    // pode gerar falso positivo. Pq ele é um listener e dificilmente vai falhar, mesmo se a implementação não acontecer.
    // cy.on('window:alert', (text)=> {
    //   expect(text).to.equal('Preencha algum CEP')

      cy.get('#swal2-title')
        .should('have.text', 'Preencha algum CEP')

        cy.get('.swal2-confirm').click()
    })

    it('cep inválido', ()=> {
      const address = { zipcode:'0000000'}

      cy.zipFind(address)
      
      cy.get('[data-cy="notice"]')
        .should('be.visible')
        .should('have.text', 'CEP no formato inválido.')
    })

    it('cep não está na área de cobertura', ()=> {
      const zipcode = '06150000'
      
      cy.get('@inputCep').type(zipcode)
      cy.get('@submitCep').click()

      cy.get('[data-cy="notice"]')
        .should('be.visible')
        .should('have.text', 'No momento não atendemos essa região.')
    })
  })

  Cypress.Commands.add('zipFind', (address, mock = false) => {

    if(mock) {
      cy.intercept('GET', '/zipcode/*', {
        stausCode: 200,
        body: {
          cep: address.zipcode,
          logradouro: address.street,
          bairro: address.district,
          cidade_uf: address.city
        }
      }).as('getZipCode')
    }

    cy.get('@inputCep').type(address.zipcode)
    cy.get('@submitCep').click()

    if(mock) {
      cy.wait('@getZipCode')
    }
  })