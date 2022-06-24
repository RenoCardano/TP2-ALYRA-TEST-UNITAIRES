TEST UNITAIRES DU CONTRAT VOTING RENAUD VIDAL

Ce fichiers contient, l'ensemble des fonction de notre contrat de vote dans l'ordre chronologique
ainsi qu'une estimation des gaz via une méthode interne estimateGaz() ainsi que via eth-gaz-reporter. 
Le coverage n'a pas pu être réalisés à cause des problématique avec ganache.

Nombre de test réalisés:   36 tests

Lirairie : 
-@openzeppelin/test-helpers pour expectRevert, expectEvent
-chai : pour les BigNumbers et expect

TEST DES FONCTION BASIQUES :
      √ should be valid to test mechanism (3ms)
      
		=> permet de s'assurer que la fonction expect de la librairie chai est fonctionnelle.
		
      √ should create a new contract instance (295ms, 2137238 gas)
      
		=> créé une instance et vérifié que son addresse est non nulle.

TEST DE DEPLOIEMENT:

      √ Should match the owner address (47ms)
      
      √ Should NOT match the voter1 address (35ms)
	  
TEST ESTIMATIMATION DES FRAIS VIA FONCTION TRUFFLE ESTIMATEGAZ FUNCTION

	Testing gaz estimation needed to deploy the contract
	
	=> permet de tester par une approche spécifique la fonction INTERNE estimatesGaz() de Truffle
	
QUANTITE DE GAZ POUR LE DEPLOIEMENT DU CONTRAT: 2137238

TEST FONCTION getVoter()

      √ should require 1 parameter (575ms)
      
      √ should require an address as parameter (410ms)
      
      √ should require a voter to be register to call the function because of onlyVoters modifier (138ms)
      
      √ should return be able to call the function when voter registered by owner => isRegistered: true , hasVoted: false, votedProposalId: 0 (237ms, 50196 gas)
      √ should return false to isRegister for voter 2 => isRegistered: false , hasVoted: false, votedProposalId: 0 (58ms)
TEST FONCTION DE REGISTRATION 
	=> addVoter()
	
      √ should require 1 parameter (20ms)
      
      √ should require an address as parameter (14ms)
      
      √ should be call be owner (134ms, 24502 gas)
      
      √ should has registered voter 1 (30ms)
      
      √ should NOT be able to autorise a second time voter 1 from owner (120ms, 28980 gas)
      
      √ should not register voter 2 when having register voter 1 (35ms)
      
      √ should emit "VoterRegistered" events (104ms, 50196 gas)
      
      √ should revert an error if stage NOT RegisteringVoters (218ms, 74384 gas)
	  
TEST FONCTION DE REGISTRATION PROPOSAL
	=>  getOneProposal() 
      √ should return proposal1 made by voter 1 and id (326ms, 76620 gas)
      
      √ should require to be a voter, voter 2 NOT registered : getOneProposal() (46ms)
      
    => addProposal() and getOneProposal() 
      √ should require to be a voter (242ms, 24845 gas)
      
      √ should require 1 string parameter NOT an empty string (128ms, 27975 gas)
      
      √ should add proposal 1 to voter 1 && emit ProposalRegistered event and id = 0 (591ms, 76620 gas)

TEST DES FONCTION DE GESTION DES WORKFLOWS ET CAPTATION DES EVENEMENT

      √ WorkflowStatus should change from 0 to 1 and emit WorkflowStatusChange  (245ms, 47653 gas)
      
      √ WorkflowStatus should change from 1 to 2 and emit WorkflowStatusChange (135ms, 30575 gas)
      
      √ WorkflowStatus should change from 2 to 3 and emit WorkflowStatusChange (154ms, 30530 gas)
      
      √ WorkflowStatus should change from 3 to 4 and emit WorkflowStatusChange (145ms, 30509 gas)
      
TEST SUR LA GESTION DES VOTES
	=>addVoter()
      √ Should expect 1 parameter (68ms)
      
      √ should put hasvoted to true when voter 1 vote has voted (421ms, 58101 gas)
      
      √ should NOT ben able to vote twice (106ms, 26684 gas) 
      
      √ should NOT put hasvoted to true to voter 2 if voter 2 has not voted yet (29ms)
      
      √ should add +1 to the proposition 2 to voter 2 structure when voter 2 vote for proposition 2 (172ms, 78013 gas)
      
      √ should trigger Voted event when voting (139ms, 60913 gas)
      
      √ Should be called be able to vote if session over (388ms, 56895 gas)
	  
TEST DE LA FONCTION DE DECOUVERTE DES RESULTATS DU VOTES
	=> tallyVotes(), show the right winner proposition: here proposal2
	
      √ should be called at stage 5 only (204ms, 26034 gas)  
      
      √ should tallyVotes proposal 2 => id 1 (524ms, 91146 gas) 
      

TEST DE L'ESTIMATION GLOBALE DES FONCTION DU CONTRAT VIA ETH GAZ REPORTER
·------------------------------------------|----------------------------|-------------|----------------------------·
|   Solc version: 0.8.13+commit.abaa5c0e   ·  Optimizer enabled: false  ·  Runs: 200  ·  Block limit: 6718946 gas  │
···········································|····························|·············|·····························
|  Methods                                                                                                         │
·············|·····························|··············|·············|·············|··············|··············
|  Contract  ·  Method                     ·  Min         ·  Max        ·  Avg        ·  # calls     ·  eur (avg)  │
·············|·····························|··············|·············|·············|··············|··············
|  Voting    ·  addProposal                ·           -  ·          -  ·      76620  ·           3  ·          -  │
·············|·····························|··············|·············|·············|··············|··············
|  Voting    ·  addVoter                   ·           -  ·          -  ·      50196  ·           7  ·          -  │
·············|·····························|··············|·············|·············|··············|··············
|  Voting    ·  endProposalsRegistering    ·           -  ·          -  ·      30575  ·           2  ·          -  │
·············|·····························|··············|·············|·············|··············|··············
|  Voting    ·  endVotingSession           ·           -  ·          -  ·      30509  ·           3  ·          -  │
·············|·····························|··············|·············|·············|··············|··············
|  Voting    ·  setVote                    ·       58101  ·      78013  ·      64995  ·           7  ·          -  │
·············|·····························|··············|·············|·············|··············|··············
|  Voting    ·  startProposalsRegistering  ·           -  ·          -  ·      47653  ·           5  ·          -  │
·············|·····························|··············|·············|·············|··············|··············
|  Voting    ·  startVotingSession         ·           -  ·          -  ·      30530  ·           4  ·          -  │
·············|·····························|··············|·············|·············|··············|··············
|  Voting    ·  tallyVotes                 ·           -  ·          -  ·      60637  ·           1  ·          -  │
·············|·····························|··············|·············|·············|··············|··············
|  Deployments                             ·                                          ·  % of limit  ·             │
···········································|··············|·············|·············|··············|··············
|  Voting                                  ·           -  ·          -  ·    2137238  ·      31.8 %  ·          -  │
·------------------------------------------|--------------|-------------|-------------|--------------|-------------·

  36 passing (2m)
